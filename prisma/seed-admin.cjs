const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const path = require('path');

const dbPath = path.join(__dirname, '../dev.db');
const db = new Database(dbPath);

try {
  // Ensure default system settings
  db.prepare(`
    INSERT OR IGNORE INTO SystemSetting (id, key, value)
    VALUES ('setting-earning', 'EarningPerVideo', '10')
  `).run();

  db.prepare(`
    INSERT OR IGNORE INTO SystemSetting (id, key, value)
    VALUES ('setting-withdrawal', 'MinWithdrawal', '500')
  `).run();

  // Ensure default admin user
  const adminEmail = 'admin@tubeloop.com';
  const existingAdmin = db.prepare("SELECT id FROM User WHERE email = ?").get(adminEmail);

  if (!existingAdmin) {
    const hashedPassword = bcrypt.hashSync('password123', 10);
    db.prepare(`
      INSERT INTO User (id, name, email, password, role, status, isApproved, accountMode, createdAt, updatedAt)
      VALUES ('admin-tubeloop-1', 'Super Admin', ?, ?, 'ADMIN', 'ACTIVE', 1, 'PLATFORM', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(adminEmail, hashedPassword);
    console.log(`Default admin created: ${adminEmail} / password123`);
  } else {
    console.log(`Admin account ${adminEmail} already exists.`);
  }

  // Also support admin@aishorts.com for compatibility
  const legacyAdmin = db.prepare("SELECT id FROM User WHERE email = 'admin@aishorts.com'").get();
  if (!legacyAdmin) {
    const hashedPassword = bcrypt.hashSync('password123', 10);
    db.prepare(`
      INSERT INTO User (id, name, email, password, role, status, isApproved, accountMode, createdAt, updatedAt)
      VALUES ('admin-legacy-1', 'Super Admin', 'admin@aishorts.com', ?, 'ADMIN', 'ACTIVE', 1, 'PLATFORM', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(hashedPassword);
    console.log('Legacy admin created: admin@aishorts.com / password123');
  }
} catch (err) {
  console.error('Error seeding admin:', err);
} finally {
  db.close();
}
