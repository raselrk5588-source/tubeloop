import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import bcrypt from 'bcrypt'

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Starting seed...')
  
  // Clean up existing data
  await prisma.uploadLog.deleteMany()
  await prisma.withdrawal.deleteMany()
  await prisma.earning.deleteMany()
  await prisma.video.deleteMany()
  await prisma.youTubeChannel.deleteMany()
  await prisma.user.deleteMany()
  await prisma.systemSetting.deleteMany()

  // System Settings
  await prisma.systemSetting.create({
    data: { key: 'EarningPerVideo', value: '10' }
  })
  await prisma.systemSetting.create({
    data: { key: 'MinWithdrawal', value: '500' }
  })

  const hashedPassword = await bcrypt.hash('password123', 10)

  // Create Admin
  const admin = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@aishorts.com',
      password: hashedPassword,
      role: 'ADMIN',
    }
  })

  // Create Channels
  const channel1 = await prisma.youTubeChannel.create({
    data: {
      name: 'AI Automation Hub',
      channelId: 'UC_ai_automation',
      status: 'CONNECTED',
    }
  })

  // Create Users
  const user1 = await prisma.user.create({
    data: {
      name: 'Rasel Khan',
      email: 'rasel@example.com',
      password: hashedPassword,
      role: 'USER',
      bKashNumber: '01711223344',
      assignedChannelId: channel1.id,
    }
  })

  const user2 = await prisma.user.create({
    data: {
      name: 'Abir Hasan',
      email: 'abir@example.com',
      password: hashedPassword,
      role: 'USER',
      bKashNumber: '01811223344',
    }
  })

  console.log('Seed completed successfully!')
  console.log('Admin: admin@aishorts.com / password123')
  console.log('User: rasel@example.com / password123')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
