# Phase A Research: Maintenance Planner Hardening & Notifications
**Feature Slug: maintenance-planner**

This document tracks browser APIs, client hydration mismatch fixes, and local notifications scheduling for home maintenance checklists.

---

### A.1 — Hydration Mismatch Audit

* **CostEstimatorWidget**:
  - The states (`includeLabor`, `laborType`, etc.) were initialized by executing `getMaterialPrice` which reads `localStorage` on initial mount.
  - Since the server build has no `localStorage`, it renders default values.
  - This mismatch in states caused React to throw hydration mismatch warnings.
  - **Resolution**: Initialize states to static constants, then load values inside a client-side `useEffect` post-mount.

* **MaintenanceCalendar & MaintenancePlanner**:
  - `isOverdue` reads `localStorage` and compares against `new Date()`. This dynamic check runs during initial render, which triggers mismatch warnings.
  - **Resolution**: Use an `isMounted` boolean state. Keep `overdue` as `false` on initial paint and compute it only when `isMounted` becomes true.

---

### A.2 — Browser Notifications API Integration

* **Standard API**:
  - Permission requests: `Notification.requestPermission()`.
  - Check status: `Notification.permission` (`default`, `granted`, `denied`).
  - Triggering: `new Notification(title, { body, icon })`.
* **Spam Prevention**:
  - Cache `hph_last_notified_date` in `localStorage` to ensure a notification is thrown at most once per day on session initialization.
