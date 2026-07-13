---
title: How We Implement AI Agent Based for Infrastructure Monitoring
description: Artikel ini membahas penerapan AI Agent untuk memantau infrastruktur secara otomatis menggunakan log dan metrik. Tujuannya adalah mendeteksi aktivitas mencurigakan lebih awal, membantu tim merespons insiden lebih cepat, dan menjaga stabilitas sistem melalui monitoring 24/7
tags:
  - architecture
  - infrastructure
  - AgenticAI
  - OpenAI
authors:
  - name: Sofyan
    description: TukangUrutKabel
    url: https://github.com/sofyan48
date: 2025-12-17
image: /blogs/Ilustration.png
---

***Disclaimer***--- Unknown node: hardBreak ---*Kebetulan saya mengujinya pada proses pemantauan trafik yang mencurigakan.*--- Unknown node: hardBreak ---*Jadi tidak ada niatan untuk mengatakan bahwa infrastruktur kami sudah aman sepenuhnya dengan adanya agent ini.*--- Unknown node: hardBreak ---*Kami hanya mencoba melakukan deteksi dini terhadap proses-proses yang tidak diinginkan—dan amit-amit kalau sampai tembus 😥.*

Siapa sih yang nggak kenal **Artificial Intelligence (AI)**? Sampai sekarang, apalagi di kalangan tech enthusiast, hampir semuanya sudah mulai melek AI. Seperti pedang bermata dua, AI punya manfaat besar, tapi juga risiko yang harus diperhatikan—terutama terkait privasi dan keamanan data.

Tanpa panjang lebar, di sini saya akan menceritakan bagaimana AI membantu saya memantau seluruh aktivitas mencurigakan di infrastruktur **kiriminaja**. Saya akan menjelaskan beberapa poin berikut:

- Kebutuhan terkait bagaimana mendapatkan data untuk diolah oleh model
- Bagaimana flow bekerja dari awal → proses → aksi
- Service apa saja yang terlibat langsung

---

## Architecture

### Requirements

- **WAF Service** (di sini saya menggunakan Armor)
- **Server** (termasuk Exporter / Alloy / Promtail)
- **Loki** (Log Collector)
- **Prometheus** (Metric Collector)
- **Monitoring Tools (**&#x62;uat sendiri menggunakan Golang) Berfungsi sebagai media komunikasi antara Agent (MinKA) dan Grafana
- **N8N atau LangChain** Di sini saya membuat service sendiri menggunakan LangChain berbasis Python Repo: <https://github.com/sofyan48/ochabot> (sudah saya modifikasi sesuai kebutuhan kantor 😄)
- **Telegram** (media akhir untuk notifikasi)

### Kenapa Tidak Pakai N8N?

Sebenarnya saya cukup telat mengetahui bahwa **N8N bisa terintegrasi langsung dengan AI**. Setelah tahu, saya sempat berpikir ulang terkait kebutuhan koneksi antar node-nya. Karena:

- Saya tidak terlalu terbiasa dengan workflow N8N
- Agent ini sudah \~80% selesai

Akhirnya saya memutuskan untuk tetap menggunakan **ochabot**.

---

## Flow Diagram

Berikut adalah flow diagram sederhana, dimulai dari **Armor** sampai kembali lagi ke **Armor** jika ada aksi yang harus dilakukan.
![image](/blogs/1-i1OxK-2HoX1xNLWlom-9pg.webp)
----------------------------------------------

## Flow Process

![image](/blogs/swimlanes-6c3839277178d83acf6f503583ec9dde.png)

### Knowledge Base (Opsional tapi Penting)

Untuk knowledge base, saya tidak membuat hal yang terlalu aneh-aneh. Karena agent dibuat menggunakan **LangChain**, saya bebas menentukan penyimpanan knowledge. Knowledge disimpan di **Elasticsearch** (opsional)

Isi knowledge:

- Pengalaman tim selama pemantauan
- Jenis log atau metric yang dianggap mencurigakan

---

## Implementation

Jika semua kebutuhan sudah terpenuhi, tahap selanjutnya adalah:

1. Membuat **Alert di Grafana**
2. Setup **Contact Point** menggunakan **Webhook**
3. Arahkan webhook ke **Monitoring Tools Service**

Sebenarnya Grafana bisa langsung mengirim alert ke Agent (MinKA), tapi saya lebih memilih ada **satu layer tambahan**. Alasannya:

- Bisa lebih selektif data apa saja yang benar-benar dikirim ke Agent
- Token AI itu mahal 😆

Kok simpel?
Iya, memang cukup simpel. Tapi tetap dibutuhkan:

- Kemampuan memanage service yang terlibat
- Keahlian untuk menemukan log yang mencurigakan
- Skill membuat query ke **Loki via Grafana**

### Contoh Query Sederhana (Deteksi Scanner)

> **Ingat:** ini hanya contoh.

```logql
count by(remote_addr, http_host) (
  count_over_time(
    {namespace="prd", app!="client-srvc", app!="home-page-web"} != `facebook`
    | json
    | request =~ `.*(\.cgi|\.php|\.gz|\.zip|\.asp|\.env|\.data|\.bak|\.old|\.sqlite|\.sql).*`
    | __error__=``
    [$__auto]
  )
)
```

Selanjutnya berikut adalah beberapa Alert Rules yang siap membantu saya untuk memantau aktifitas saya sebagai tukang urut kabel.

![image](/blogs/Screenshot-2025-12-17-at-11.44.48.png)

Selanjutnya berikut hasil aksi yang dilakukan oleh agent

![image](/blogs/Screenshot-2025-12-17-at-11.49.12.png)

Berikut adalah Contoh Agent kami bekerja untuk membantu tukang urut kabel ini

![image](/blogs/Screenshot-2025-12-17-at-11.53.58.png)

## Kesimpulan

Dengan adanya AI yang dapat memantau semua aktifitas yang saya kira tidak bisa saya pantau sendiri sehingga sangat membantu saya. Mungkin kekurangannya masih mahal tapi saya bisa kontrol di monitor toolsnya terkait token yang dikirimkan hehe. butuh di tingkatkan terus agar lebih simpel yah saya akan terus belajar dan koreksi bagaimana AI ini bekerja untuk membantu saya pada tugas yang lebih kompleks.
