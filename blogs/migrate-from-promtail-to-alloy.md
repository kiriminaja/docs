---
title: How We Migrated from Promtail to Grafana Alloy
description: A practical migration story from Promtail to Grafana Alloy for Kubernetes logging, without downtime and with better log pipelines.
tags:
  - infrastructure
  - grafana
  - alloy
authors:
  - name: Sofyan
    description: TukangUrutKabel
    url: https://github.com/sofyan48
date: 2025-12-23
image: /blogs/promtail-to-alloy.png
---

# How We Migrated from Promtail to Grafana Alloy

*Panduan praktis migrasi logging stack Kubernetes dari Promtail yang akan deprecated ke Grafana Alloy — tanpa mengganggu production.*

---

## Kenapa Kami Harus Pindah

Selama bertahun-tahun, Promtail menjadi pilihan utama kami untuk mengirim log Kubernetes ke Grafana Loki. Konfigurasinya simpel, ringan, dan "just works".

Lalu di awal 2025, Grafana Labs mengumumkan: **Promtail akan deprecated pada Februari 2026**.

Rekomendasi resmi mereka? Migrasi ke **Grafana Alloy**.

Ini bukan soal Promtail "jelek" — tapi soal arah strategis:

- Grafana ingin unified agent untuk log, metric, dan trace
- Industri observability bergerak ke OpenTelemetry
- Alloy adalah solusi future-proof

Kami punya dua pilihan:

1. Tunggu sampai 2026 dan buru-buru migrasi
2. Mulai sekarang dan lakukan dengan benar

Kami pilih opsi 2.

---

## Timeline Deprecation

Yang perlu kamu tahu:

- **Februari 2026**: Promtail resmi deprecated
- **Setelah deprecation**: Tidak ada fitur baru, hanya critical bug fixes
- **Pada akhirnya**: Tidak ada dukungan resmi di ekosistem Grafana

### Risiko Kalau Menunda

- Tekanan waktu menjelang deadline
- Tim belum familiar dengan Alloy
- Production issue tanpa dukungan official
- Waktu terbatas untuk testing proper

### Keuntungan Migrasi Sekarang

- Waktu cukup untuk testing menyeluruh
- Belajar Alloy dengan santai
- Hindari keputusan gegabah karena panik
- Transisi smooth tanpa tekanan

---

## Apa itu Grafana Alloy?

Alloy bukan sekadar "pengganti Promtail" — ini adalah cara berpikir ulang tentang observability agent.

**Alloy adalah:**

- Distribusi OpenTelemetry Collector yang dioptimalkan Grafana
- Menggunakan DSL ala Promtail untuk backward compatibility
- Native ke ekosistem Grafana (Loki, Mimir, Tempo)

**Keunggulan Utama:**

1. **Unified Agent**: Log sekarang, metric dan trace nanti (tidak perlu banyak agent)
2. **Pipeline Processing Powerful**: JSON parsing lebih baik, data masking fleksibel
3. **Declarative & Modular**: Configuration as code
4. **Official Replacement**: Ini roadmap Grafana, bukan eksperimen

---

## Strategi Migrasi Kami (Zero Downtime)

Kami tidak langsung cabut Promtail dalam semalam. Begini cara kami:

### Phase 1: Parallel Deployment

- Deploy Alloy sebagai DaemonSet berdampingan dengan Promtail
- Kedua agent kirim ke Loki instance yang sama
- Gunakan label dan job name yang identik

### Phase 2: Validation

- Bandingkan volume log antara kedua agent
- Verifikasi konsistensi label
- Test query dashboard

### Phase 3: Gradual Cutover

- Route satu namespace per satu waktu
- Monitor untuk issue
- Keep Promtail running sebagai backup

### Phase 4: Full Cutover

- Hapus Promtail sepenuhnya
- Bersihkan konfigurasi lama

**Result:** Zero production downtime.

---

## Konfigurasi Alloy

Begini tampilan setup Alloy production kami:

### Loki Endpoint

```alloy
loki.write "default" {
  endpoint {
    url       = "http://loki:3100/loki/api/v1/push"
    tenant_id = "tenant1"
  }
}
```

### Log Processing Pipeline

Kami bangun pipeline untuk:

- Drop noise dari kube-probe
- Parse CRI container logs
- Extract tracing fields (trace\_id, span\_id)
- Parse nested JSON messages
- Mask data sensitif (password, token, OTP)

```alloy
loki.process "pipeline" {
  // Drop kube-probe
  stage.drop {
    expression = ".*kube-probe.*"
  }

  // CRI log parsing
  stage.cri {}

  // Static labels
  stage.labels {
    values = {
      service_name = "app",
    }
  }

  // Extract trace fields
  stage.json {
    expressions = {
      trace_id = "trace_id",
      span_id  = "span_id",
    }
  }

  // Parse nested JSON
  stage.json {
    expressions = {
      message = "message",
    }
  }

  stage.json {
    source = "message"
    expressions = {
      request_body = "request_body",
    }
  }

  // Mask passwords
  stage.regex {
    expression = "\\\"password\\\"\\s*:\\s*\\\"(?P<password>[^\\\"]+)\\\""
  }

  stage.replace {
    expression = "\\\"password\\\"\\s*:\\s*\\\"(?P<password>[^\\\"]+)\\\""
    replace    = "\"***\""
  }

  // Similar masking for token, otp, recaptcha_token...

  stage.output {
    source = "."
  }

  forward_to = [loki.write.default.receiver]
}
```

### Kubernetes Discovery & Labeling

Alloy melakukan discovery pods dan extract metadata:

```alloy
discovery.kubernetes "pods" {
  role = "pod"
}

discovery.relabel "pods" {
  targets = discovery.kubernetes.pods.targets

  // Extract namespace
  rule {
    source_labels = ["__meta_kubernetes_namespace"]
    target_label  = "namespace"
  }

  // Extract pod name
  rule {
    source_labels = ["__meta_kubernetes_pod_name"]
    target_label  = "pod"
  }

  // Extract container name
  rule {
    source_labels = ["__meta_kubernetes_pod_container_name"]
    target_label  = "container"
  }

  // Create job label
  rule {
    source_labels = ["__meta_kubernetes_namespace", "__meta_kubernetes_pod_name"]
    separator     = "/"
    target_label  = "job"
  }

  // Extract app label
  rule {
    source_labels = ["__meta_kubernetes_pod_label_app"]
    target_label  = "app"
  }

  // Extract node name as instance
  rule {
    source_labels = ["__meta_kubernetes_pod_node_name"]
    target_label  = "instance"
  }

  // Build log file path
  rule {
    source_labels = ["__meta_kubernetes_namespace", "__meta_kubernetes_pod_name", "__meta_kubernetes_pod_uid", "__meta_kubernetes_pod_container_name"]
    separator     = "/"
    regex         = "(.+)/(.+)/(.+)/(.+)"
    replacement   = "/var/log/pods/*${1}_${2}_${3}*/${4}/*.log"
    target_label  = "__path__"
  }
}
```

### File Tailing

```alloy
local.file_match "pods" {
  path_targets = discovery.relabel.pods.output
}

loki.source.file "pods" {
  targets       = local.file_match.pods.targets
  forward_to    = [loki.process.pipeline.receiver]
  tail_from_end = true
}
```

---

## Arsitektur Deployment

Kami deploy Alloy sebagai **DaemonSet** dengan:

### Komponen Utama:

- **DaemonSet**: Collect log dari semua node
- **Privileged container**: Akses host /var/log
- **RBAC enabled**: Permission untuk pod discovery
- **InitContainer**: Increase inotify limits

### Konfigurasi Helm:

```yaml
alloy:
  configMap:
    create: true
    content: |
      logging {
        level  = "info"
        format = "logfmt"
      }

      loki.write "default" {
        endpoint {
          url       = "http://YOUR_LOKI_HOST/loki/api/v1/push"
          tenant_id = "tenant1"
        }
      }

      loki.process "pipeline" {
        // drop kube-probe
        stage.drop {
          expression = ".*kube-probe.*"
        }

        // CRI log parsing
        stage.cri {}

        // static label
        stage.labels {
          values = {
            service_name = "app",
          }
        }

        // extract tracing fields
        stage.json {
          expressions = {
            trace_id = "trace_id",
            span_id  = "span_id",
          }
        }

        // extract message
        stage.json {
          expressions = {
            message = "message",
          }
        }

        // parse nested json from message
        stage.json {
          source = "message"
          expressions = {
            request_body = "request_body",
          }
        }

        // mask password
        stage.regex {
          expression = "\\\"password\\\"\\s*:\\s*\\\"(?P<password>[^\\\"]+)\\\""
        }

        stage.replace {
          expression = "\\\"password\\\"\\s*:\\s*\\\"(?P<password>[^\\\"]+)\\\""
          replace    = "\"***\""
        }

        // mask token
        stage.regex {
          expression = "\\\"token\\\"\\s*:\\s*\\\"(?P<token>[^\\\"]+)\\\""
        }

        stage.replace {
          expression = "\\\"token\\\"\\s*:\\s*\\\"(?P<token>[^\\\"]+)\\\""
          replace    = "\"****\""
        }

        // mask otp
        stage.regex {
          expression = "\\\"otp\\\"\\s*:\\s*\\\"(?P<otp>[^\\\"]+)\\\""
        }

        stage.replace {
          expression = "\\\"otp\\\"\\s*:\\s*\\\"(?P<otp>[^\\\"]+)\\\""
          replace    = "\"***\""
        }

        // mask recaptcha token
        stage.regex {
          expression = "\\\"recaptcha_token\\\"\\s*:\\s*\\\"(?P<recaptcha_token>[^\\\"]+)\\\""
        }

        stage.replace {
          expression = "\\\"recaptcha_token\\\"\\s*:\\s*\\\"(?P<recaptcha_token>[^\\\"]+)\\\""
          replace    = "\"***\""
        }

        // output final log line
        stage.output {
          source = "."
        }

        forward_to = [loki.write.default.receiver]
      }

      discovery.kubernetes "pods" {
        role = "pod"
      }

      discovery.relabel "pods" {
        targets = discovery.kubernetes.pods.targets

        rule {
          source_labels = ["__meta_kubernetes_namespace"]
          target_label  = "namespace"
        }

        rule {
          source_labels = ["__meta_kubernetes_pod_name"]
          target_label  = "pod"
        }

        rule {
          source_labels = ["__meta_kubernetes_pod_container_name"]
          target_label  = "container"
        }

        rule {
          source_labels = ["__meta_kubernetes_namespace", "__meta_kubernetes_pod_name"]
          separator     = "/"
          target_label  = "job"
        }

        rule {
          source_labels = ["__meta_kubernetes_pod_label_app"]
          target_label  = "app"
        }

        rule {
          source_labels = ["__meta_kubernetes_pod_node_name"]
          target_label  = "instance"
        }

        rule {
          source_labels = ["__meta_kubernetes_namespace", "__meta_kubernetes_pod_name", "__meta_kubernetes_pod_uid", "__meta_kubernetes_pod_container_name"]
          separator     = "/"
          regex         = "(.+)/(.+)/(.+)/(.+)"
          replacement   = "/var/log/pods/*${1}_${2}_${3}*/${4}/*.log"
          target_label  = "__path__"
        }
      }

      local.file_match "pods" {
        path_targets = discovery.relabel.pods.output
      }

      loki.source.file "pods" {
        targets       = local.file_match.pods.targets
        forward_to    = [loki.process.pipeline.receiver]
        tail_from_end = true
      }

  mounts:
    # -- Mount /var/log from the host into the container for log collection.
    varlog: true
    dockercontainers: false

controller:
  type: daemonset

  nodeSelector: {}

  tolerations:
    - operator: Exists
      effect: NoSchedule

  initContainers:
    - name: sysctl
      image: busybox
      securityContext:
        privileged: true
        runAsUser: 0
      command:
        - sh
        - -c
        - |
          sysctl -w fs.inotify.max_user_instances=1024
          sysctl -w fs.inotify.max_user_watches=1048576

  securityContext:
    runAsUser: 0
    runAsGroup: 0
    fsGroup: 0

  resources:
    requests:
      cpu: 100m
      memory: 128Mi
    limits:
      cpu: 500m
      memory: 512Mi

  

serviceAccount:
  create: true
  name: alloy

rbac:
  create: true

ingress:
  enabled: false

podLabels:
  app: alloy
```

---

## Hasil Setelah Migrasi

Setelah cutover penuh, ini yang kami amati:

✅ **Log mengalir normal** — tidak ada data loss :br
✅ **Label konsisten** — dashboard tetap berfungsi :br
✅ **Pipeline lebih bersih** — kualitas data lebih baik :br
✅ **Data sensitif ter-mask** — keamanan meningkat :br
✅ **Resource usage stabil** — tidak ada performance regression

**Bonus:** Kami sekarang siap ingest trace dan metric tanpa tambah agent baru.

---

## Lessons Learned

### 1. Migrasi Dini Mengurangi Risiko

Jangan tunggu sampai deadline. Mulai sekarang saat kamu punya waktu untuk test dengan baik.

### 2. Parallel Deployment adalah Kunci

Menjalankan kedua agent side-by-side memberikan confidence dan fallback plan.

### 3. Kompatibilitas Label Penting

Pastikan label Alloy match dengan Promtail. Ini menjaga dashboard tetap berfungsi.

### 4. Pipeline Processing Sangat Powerful

Kami kaget betapa lebih baik Alloy handle complex JSON parsing dan data masking.

### 5. Alloy Production-Ready

Meskipun "baru," Alloy stabil. Ini berbasis teknologi OpenTelemetry Collector yang mature.

---

## Apakah Kamu Harus Migrasi?

Kalau kamu masih pakai Promtail, tanya diri sendiri:

- **Apakah kamu ingin siap sebelum deadline 2026?**
- **Apakah tim kamu nyaman dengan migrasi last-minute?**
- **Apakah kamu berpikir tentang unified observability (log + metric + trace)?**

Kalau jawabannya "ya" untuk salah satu pertanyaan di atas, sudah waktunya mulai planning migrasi Alloy.

---

## Getting Started

Ini roadmap singkatnya:

### Week 1: Learning

- Baca docs Grafana Alloy
- Pahami syntax konfigurasi
- Bandingkan dengan config Promtail kamu

### Week 2-3: Lab Testing

- Deploy Alloy di dev/staging
- Test log collection
- Verifikasi pipeline processing

### Week 4-5: Production Parallel Run

- Deploy berdampingan dengan Promtail
- Bandingkan log dan dashboard
- Monitor resource usage

### Week 6+: Gradual Cutover

- Route satu namespace per waktu
- Monitor untuk issue
- Hapus Promtail saat sudah yakin

---

## Penutup

Migrasi dari Promtail ke Alloy bukan soal "upgrade" — ini tentang stay current dengan roadmap Grafana.

Promtail belum mati, tapi akan mati. **Februari 2026 lebih dekat dari yang kamu kira.**

Mulai migrasi sekarang. Diri kamu di masa depan (dan tim kamu) akan berterima kasih.

---

## Resources

- [Grafana Alloy Official Docs](https://grafana.com/docs/alloy/latest/)
- [Promtail Deprecation Announcement](https://grafana.com/blog/)
- [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/)
- [Migration Config Kami (GitHub)](https://github.com/kiriminaja/kaj-kubernetes-tools/tree/main/alloy)

---

*Punya pertanyaan tentang migrasi ke Alloy? Drop di kolom komentar. Saya akan bantu sebisa mungkin.*

*Artikel ini membantu? Kasih clap 👏 dan share ke tim kamu.*
