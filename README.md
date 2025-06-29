# Tampermonkey API Request Interceptor

## ⚠️ Disclaimer

This script is intended for **educational purposes only**. It is **not affiliated with or endorsed by any specific platform or website**. Use responsibly and always respect applicable Terms of Service.

---

## 📌 Use Cases

### 1. Capture Filtered Request Payloads

When applying filters on a website, this script intercepts API request bodies in real time. You can copy these directly into your own automation tool (e.g., a Python scraper) without manually inspecting network traffic or reconstructing payloads by hand.

### 2. Browser-Based Automation for Authenticated Actions

In scenarios where user actions generate authenticated API requests (e.g., downloading attachments), this tool helps bridge the gap between manual interaction and automation.

**Example use case:**  
A site lets you select users and download attachments, but doesn’t support bulk downloads. This script captures the request triggered by each selection, extracts attachment IDs, and generates direct download links. These can then be accessed via a batch download button — skipping repetitive actions and saving time.

---

## 🖼️ Preview

![preview](preview.gif?raw=true "preview")
