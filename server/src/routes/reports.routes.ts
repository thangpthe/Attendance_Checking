import { Router } from 'express'
import ExcelJS from 'exceljs'
import { authMiddleware, adminOnly } from '../middleware/auth.js'
import { AttendanceLogModel } from '../models/AttendanceLog.js'
import { UserModel } from '../models/User.js'
import { LocationModel } from '../models/Location.js'

const router = Router()

router.get('/attendance.xlsx', authMiddleware, adminOnly, async (req, res) => {
  const { from, to } = req.query as { from?: string; to?: string }
  const filter: any = {}
  if (from || to) {
    filter.date = {}
    if (from) filter.date.$gte = from
    if (to) filter.date.$lte = to
  }

  const logs = await AttendanceLogModel.find(filter).sort({ date: -1 }).lean()
  const userIds = [...new Set(logs.map(l => l.userId.toString()))]
  const locationIds = [...new Set(logs.map(l => l.locationId?.toString()).filter(Boolean))]
  const users = await UserModel.find({ _id: { $in: userIds } }).lean()
  const locations = await LocationModel.find({ _id: { $in: locationIds } }).lean()
  const userMap = new Map(users.map(u => [u._id.toString(), u]))
  const locMap = new Map(locations.map(l => [l._id.toString(), l]))

  const wb = new ExcelJS.Workbook()
  const sheet = wb.addWorksheet('Chấm công')
  sheet.columns = [
    { header: 'Ngày', key: 'date', width: 12 },
    { header: 'Nhân viên', key: 'name', width: 24 },
    { header: 'Phòng ban', key: 'dept', width: 18 },
    { header: 'Địa điểm', key: 'loc', width: 20 },
    { header: 'Check-in', key: 'in', width: 20 },
    { header: 'Check-out', key: 'out', width: 20 },
    { header: 'Trạng thái', key: 'status', width: 14 },
  ]
  sheet.getRow(1).font = { bold: true }

  for (const l of logs) {
    const u = userMap.get(l.userId.toString())
    const loc = l.locationId ? locMap.get(l.locationId.toString()) : null
    sheet.addRow({
      date: l.date,
      name: u?.name || '—',
      dept: u?.department || '—',
      loc: loc?.name || '—',
      in: l.checkinAt ? new Date(l.checkinAt).toLocaleString('vi-VN') : '',
      out: l.checkoutAt ? new Date(l.checkoutAt).toLocaleString('vi-VN') : '',
      status: l.status,
    })
  }

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  res.setHeader('Content-Disposition', 'attachment; filename="bao-cao-cham-cong.xlsx"')
  await wb.xlsx.write(res)
  res.end()
})

export default router