---
title: Infrastructure And Architecture Transformation
description: Transformasi Architecture dan Infrastructure
date: 2025-12-15
image: /blogs/ilustration2.png
tags:
  - architecture
  - infrastructure
authors:
  - name: Sofyan
    description: TukangUrutKabel
    url: https://github.com/sofyan48
---

# Architecture And Infrastructure

**Setelah sekian purnama akhirnya nulis lagi**

Kali ini storynya terkait dengan transformasi infrastructure dikantor saya, banyak asam manisnya mulai dari proses migrasi onpremis, ke cloud provider dan akhirnya menggunakan container di cloud provider.

Diakhir 2023 saya masuk sebagai software architect dengan persiapan pengalaman saya sebelumnya, akhirnya terlindas kenyataan bahwa infrastructure saat ini belumlah memadai dari sisi apa yang saya ingin terapkan.

## Transformasi to Container Base

Pelan-pelan kata atasan saya, akhirnya dengan modalkan kepercayaan dan coba pendekatan dengan leader yang bertanggung jawab setiap proses bisnis yang ada, pelan-pelan semua kode yang ada di VM saat itu mulai di containerkan dengan memanfaatkan docker compose sebagai orchestrasinya, dari transformasi ini akhirnya muncul kejadian (how to scale it). saat itu mau langsung gunakan kubernetes tapi tapi masih banyak yang menjadi kendala.

## Transformasi Penerapan CICD

Setelah transformasi ke container Pekerjaan Rumah saya selanjutnya bagaimana mempercepat Deployment. dengan bermodalkan sok tahu saat itu (saya coba research semua tools CICD) akhirnya saya memanfaatkan Github Action, sembari hemat-hemat biaya dengan memanfaatkan gratisannya

## Transformasi to Google Manage Instance Group (MIG)

Setelah pencarian fitur yang bisa dimanfaatkan akhirnya ada opsi MIG, lah kenapa gak pake app engine, saat itu saya masih ragu terkait cost apalagi experience saya gak pernah pake GCP jadinya dari pada ragu mending milih MIG (secara behaviour tidak jauh berbeda dengan VM untuk manage nya), dari sini bisnis terus berkembang akhirnya muncul pertanyaan lagi (scalenya is slow) jadinya tidak reliable untuk handle request yang datang secara tiba-tiba. 6 - 7 bulan berjibaku dengan keadaan akhirnya dipaksa untuk menggunakan Orkestrasi(kubernetes)

## Transformasi to Kubernetes

Nah saat menggunakan kubernetes, semua masalah teratasi namun sebagai seorang yang cukup peka dengan biaya akhirnya konsultasi terkait biaya dan tidak ada masalah terkait itu, 30an service waktu segera dimigrasi, dengan bantuan tim lainnya akhirnya tercapai. eeeh masih ada problem yang harus dicari solusinya bagaimana agar menjaga kualitas dan meminimalkan error yang bisa saja sampe di production, sebagai seorang yang bergelut di infrastructure dan architecture akhirnya bisa membantu juga.

## Transformasi From Deployment to Argo Rollout Deployment

Akhirnya di part terakhir, akhirnya di posisi ini saya menerapkan Blue-Green Deployment dan bertahan hingga saat ini. PR nya lagi saat itu adalah log, nah disini saya memutuskan menggunakan Grafana Stack (Loki, Alloy dan Tempo) sebagai medianya dan cukup stabil sampai sekarang

Berikut gambaran simpel Infrastructure saat ini

![image](/blogs/infrastructure.png)

Berikut gambaran Deployment Proses Saat ini

![image](/blogs/deployment.png)
