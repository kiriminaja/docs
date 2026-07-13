---
title: Migrasi Nginx Ingres Ke Gateway API
description: Migrasi Nginx Ingres Ke Gateway API Dengan Traefik
date: 2025-12-15
image: /blogs/nginx-traefik.png
tags:
  - architecture
  - infrastructure
authors:
  - name: Sofyan
    description: TukangUrutKabel
    url: https://github.com/sofyan48
---

# How We Change Traffic Routing at KiriminAja

Selama 2 tahun ini, **Kubernetes Ingress** menjadi fondasi utama bagi semua service dalam mengatur routing dan akses eksternal. Namun, seiring pertumbuhan arsitektur **KiriminAja** yang semakin kompleks, Ingress mulai menunjukkan batasan — kurangnya ekspresivitas, keterbatasan multi-protocol, serta variasi implementasi antar controller.

Di sinilah **Gateway API** hadir sebagai jawaban. Standar baru ini tidak hanya menggantikan Ingress, tetapi juga memberikan pendekatan yang lebih **modular**, **fleksibel**, dan **powerful** dalam mengatur lalu lintas aplikasi berbasis Kubernetes. Selain itu, **nginx-ingress sudah retired**, sehingga migrasi menjadi kebutuhan, bukan sekadar pilihan.

Artikel ini membahas perjalanan kami dalam memigrasikan arsitektur dari **Ingress berbasis NGINX** menuju **Gateway API menggunakan Traefik**, lengkap dengan perubahan arsitektur, proses operasional, hingga dampaknya bagi infrastruktur KiriminAja.

---

## Why We Moved: The Problem With Traditional Ingress

Seiring meningkatnya beban layanan KiriminAja — mulai dari pemisahan trafik **internal & public** hingga kebutuhan menangani **HTTP dan gRPC secara bersamaan** — Ingress mulai membatasi kemampuan operasional kami.

Beberapa tantangan utama yang kami hadapi:

### 1. Routing gRPC dan Multi-Protocol Tidak Konsisten

Ingress kurang fleksibel dalam menangani trafik non-HTTP. :br
Sebaliknya, **Gateway API** menyediakan mekanisme standar seperti `GRPCRoute` dan `TCPRoute` untuk kebutuhan multi-protocol.

### 2. Observability dan Structured Routing Kurang Optimal

Gateway API memperkenalkan konsep **Gateway**, **Route**, dan **GatewayClass** yang jauh lebih modular, terstruktur, dan mudah dikembangkan dibandingkan pendekatan Ingress tradisional.

### 3. Multiple Load Balancer / NEG Requirement

Untuk memisahkan trafik **internal** dan **public**, kami membutuhkan arsitektur yang mampu mengelola **dua NEG berbeda** tanpa solusi workaround atau hack.

### 4. Ingress Annotations Fatigue

Sebagian besar konfigurasi Ingress bergantung pada **annotation vendor-specific**. :br
Gateway API menyelesaikan masalah ini dengan **CRD-native configuration** yang lebih bersih, konsisten, dan maintainable.

---

## The Solution: Adopting Gateway API With Traefik Controller

Kami memilih **Traefik** sebagai Gateway API controller, bukan NGINX. Setelah melakukan riset bersama tim — terutama terkait **metric dan observability** — kami menemukan bahwa kapabilitas metric pada NGINX tidak sepenuhnya memenuhi kebutuhan kami, sementara **Traefik sangat cukup dan sesuai** dengan kebutuhan operasional KiriminAja.

Selanjutnya, muncul pertanyaan: *mengapa tidak tetap menggunakan Ingress dengan Traefik?*

Keputusan kami jelas. Migrasi ini bukan hanya pergantian controller, tetapi juga bagian dari **pembaruan arsitektur dan infrastruktur secara menyeluruh**. Oleh karena itu, kami memutuskan untuk **tidak lagi menggunakan Ingress**, dan sepenuhnya beralih ke **Gateway API** sebagai fondasi routing yang lebih future-proof.

Kenapa tidak menggunakan Gateway Class manage dari GKE itu sendiri, kembali lagi berdasarkan pengalaman saya metricnya hanya bisa di akses di Cloud monitoring nah ini sangat membutuhkan biaya ketika saya butuh metric tersebut untuk di olang di Kubernetes atau Grafana Itu sendiri

## Architecture Overview

### Request Flow Diagram

![image](/blogs/request_flow.webp)

### Flow Diagram

![image](/blogs/flow-diagram.webp)

## Public Gateway

Gateway ini digunakan untuk trafik **public (external)**.

```yaml [gateway-public.yaml]
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: gateway
  namespace: traefik
spec:
  gatewayClassName: traefik
  listeners:
    - name: web
      protocol: HTTP
      port: 8000
      allowedRoutes:
        namespaces:
          from: All
        kinds:
          - kind: GRPCRoute
          - kind: HTTPRoute
```

## Internal Gateway

Gateway ini digunakan untuk trafik **internal antar service**.

```yaml [gateway-internal.yml]
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: gateway-internal
  namespace: traefik
spec:
  gatewayClassName: traefik
  listeners:
    - name: intl-web
      protocol: HTTP
      port: 8001
      allowedRoutes:
        namespaces:
          from: All
        kinds:
          - kind: GRPCRoute
          - kind: HTTPRoute
```

---

## Traefik Helm Configuration

Pada manifest ini environment **development** menggunakan **MetalLB**, sedangkan di **production** menggunakan **Google Cloud Load Balancer (GCP)**.

# Traefik Gateway Development Environment

```yaml [values.yaml]
image:
  registry: docker.io
  repository: traefik
  pullPolicy: IfNotPresent

deployment:
  enabled: true
  kind: Deployment
  replicas: 1
  terminationGracePeriodSeconds: 60
  minReadySeconds: 0
  goMemLimitPercentage: 0.9

podDisruptionBudget:
  enabled: false

ingressClass:
  enabled: false
  isDefaultClass: true

experimental:
  abortOnPluginFailure: false
  fastProxy:
    enabled: false
    debug: false
  kubernetesGateway:
    enabled: false
  otlpLogs: false
  knative: false

gateway:
  enabled: false

gatewayClass:
  enabled: true

api:
  dashboard: false

providers:
  kubernetesCRD:
    enabled: true
    allowCrossNamespace: false
    allowExternalNameServices: false
    allowEmptyServices: true
    nativeLBByDefault: false
  kubernetesIngress:
    enabled: false
  kubernetesGateway:
    enabled: true

service:
  enabled: true
  type: LoadBalancer
  annotations:
    metallb.universe.tf/loadBalancerIPs: "10.184.0.5"
  additionalServices:
    internal:
      type: LoadBalancer
      annotations:
        metallb.universe.tf/loadBalancerIPs: "10.184.0.6"
```

## implementasi

### Gateway

![image](/blogs/penerapan1.webp)

### Route

![image](/blogs/route.webp)

### Metric

![image](/blogs/metric.webp)

## Conclusion

Migrasi dari **Kubernetes Ingress** ke **Gateway API dengan Traefik** bukan sekadar pergantian tooling, tetapi sebuah **evolusi arsitektur** dalam mengelola trafik di KiriminAja.

Ingress telah melayani kami dengan baik selama bertahun-tahun, namun seiring meningkatnya kompleksitas sistem—multi-protocol (HTTP & gRPC), pemisahan trafik public dan internal, serta kebutuhan observability yang lebih matang—pendekatan lama mulai mencapai batasnya.

Gateway API memberikan fondasi yang lebih **terstruktur, deklaratif, dan future-proof**. Dengan pemisahan yang jelas antara **Gateway**, **Route**, dan **GatewayClass**, kami dapat:

- Mengelola trafik public dan internal secara clean tanpa hack
- Mendukung gRPC dan protokol non-HTTP secara native
- Mengurangi ketergantungan pada annotation vendor
- Meningkatkan konsistensi konfigurasi dan operasional

Pemilihan **Traefik** sebagai Gateway controller melengkapi kebutuhan ini dengan dukungan metric, integrasi Kubernetes yang matang, serta fleksibilitas deployment baik di **development (MetalLB)** maupun **production (GCP Load Balancer)**.

Hasil akhirnya adalah arsitektur routing yang lebih **scalable, observable, dan maintainable**, sekaligus mempersiapkan infrastruktur KiriminAja untuk pertumbuhan dan kebutuhan yang lebih kompleks di masa depan.
