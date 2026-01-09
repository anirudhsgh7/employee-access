**Smart NFC-Based Attendance system for Mobile & Fixed Assets access** <br/>
Anirudh Singh 2023091 <br/>
Ujjwal Goel 2023565

**Project Abstract –** <br/>
The NFC-Based Employee Access Control System is a cloud-connected embedded IoT platform designed to automate attendance and enforce secure, role-based physical access across modern organizations. It replaces manual logs and legacy RFID systems with a real-time, intelligent infrastructure capable of handling multi-zone and multi-location deployments.

Built using industrial embedded hardware and a scalable web backend, the system provides fast contactless authentication, centralized monitoring, offline-resilient edge nodes, and audit-grade security — making it suitable for corporate, institutional, and government environments.

## 🚀 Key Features

- Contactless NFC authentication  
- Real-time cloud attendance logging  
- Automatic work-hour calculation  
- Role-based room access control  
- Electronic door lock support  
- Centralized admin dashboard  
- Offline operation with cached permissions  
- Node heartbeat & fault monitoring  
- Plug-and-play node deployment  
- Multi-campus scalability  
- Audit-ready access logs  
- Production-ready modular design  

---

## 🧠 Technology Stack

**Frontend**
- Next.js  
- TypeScript  
- Tailwind CSS  
- Shadcn/UI  

**Backend**
- Node.js  
- Next.js API Routes  

**Database**
- PostgreSQL (Neon Serverless)  

**Hardware**
- STM32G0B1RE  
- X-NUCLEO-NFC09A1  
- ESP32 DevKit v1  

**Security**
- bcrypt password hashing  
- Secure HTTP-only cookies  
- Rate limiting & brute-force protection  

---

## 🔌 Hardware Architecture

Each access node consists of:

- STM32G0B1RE microcontroller  
- X-NUCLEO-NFC09A1 NFC reader  
- ESP32 Wi-Fi module  
- Passive NFC UID cards  

### Data Flow
NFC Card → STM32 → UART → ESP32 → HTTPS → Cloud Server <br/>
Nodes support offline access decisions, automatic retry logic, and live heartbeat monitoring.

---

## 🏢 Use-Case Domains

- Corporate offices  
- Universities & multi-campus institutes  
- Hospitals  
- Warehouses  
- Government facilities  

---

## ⭐ Why This System Stands Out

- Prevents proxy attendance  
- Enables real-time access enforcement  
- Scales without backend code changes  
- Works even during network outages  
- Ready for pilot deployment and commercialization  

---

## 📈 Future Enhancements

- Camera-based verification  
- Mobile admin application  
- GPS-based scan location tracking  
- Custom PCB fabrication  
- AI-based anomaly detection  

--
