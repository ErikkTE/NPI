# NPI Booking Desk

เว็บสำหรับพนักงานค้นหาเลขออเดอร์จาก Google Sheet และเปิด Google Form เพื่อบันทึกเลขจองใหม่

## เริ่มใช้งาน

```bash
npm install
npm run dev
```

สำหรับ build production:

```bash
npm run build
npm run preview
```

## แหล่งข้อมูล

- Google Form: แบบฟอร์มจริงถูกผูกไว้ใน `src/App.jsx`
- Google Sheet: ใช้ `SHEET_ID` และ `SHEET_GID` ใน `src/lib/sheet.js`
- ชีตต้องเปิดให้ผู้ใช้เว็บอ่านข้อมูลได้ จึงจะดึง CSV/Visualization endpoint ได้จากเบราว์เซอร์

ระบบค้นหาจะแสดงข้อมูลจริงจากคอลัมน์ `สถานะบิลมัดจำ`, `เลขออเดอร์`, `พนักงาน` และ `สถานะสินค้า` เมื่อเชื่อมต่อสำเร็จ หากปลายทางอ่านไม่ได้จะเปลี่ยนเป็นโหมดสาธิตด้วยข้อมูลตัวอย่างที่ตรวจสอบแล้ว
