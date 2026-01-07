**Smart NFC-Based Attendance system for Mobile & Fixed Assets access** <br/>
Anirudh Singh 2023091 <br/>
Ujjwal Goel 2023565

**Project Abstract –** <br/>
This project delivers an IoT-enabled, production-ready attendance and room-access device that authenticates users via NFC ID cards and securely streams real-time attendance events to a central server for analytics and role-based access decisions. Built on an STM32 with the X-NUCLEO-NFC09A1 and integrated Wi-Fi, the next phase covers custom PCB design and fabrication to consolidate the MCU, NFC front end, power management, and I/O into a compact, reliable module with a smaller footprint. Planned features include offline attendance caching with auto-resync, OTA firmware updates, ESD/EMI protections, service test points, and an optional front-panel display for live status and user feedback. The architecture leaves clear paths for future add-ons like cameras, electronic door actuation, and mobile alerts. The result is a scalable IoT product for campuses that reduces manual overhead, discourages proxy attendance, and is ready for pilot deployment and small-batch manufacturing.

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
