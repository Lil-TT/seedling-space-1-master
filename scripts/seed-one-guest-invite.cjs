/* 开发用：写入一条 GuestInvite 并打印明文口令（需已配置 DATABASE_URL） */
const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");

function hashGuestToken(raw) {
  return crypto.createHash("sha256").update(raw, "utf8").digest("hex");
}

function generateGuestRawToken() {
  return crypto.randomBytes(24).toString("base64url");
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("缺少 DATABASE_URL，请在项目根目录执行并确保 .env 已加载。");
    process.exit(1);
  }
  const prisma = new PrismaClient();
  const raw = generateGuestRawToken();
  const tokenHash = hashGuestToken(raw);
  const invite = await prisma.guestInvite.create({
    data: {
      tokenHash,
      label: "本地测试·模拟开放日展台",
      expiresAt: new Date(Date.now() + 30 * 86400000),
    },
  });
  const base =
    process.env.GUEST_TEST_BASE_URL?.replace(/\/$/, "") || "http://localhost:3000";
  console.log("\n--- 测试访客口令（数据库已写入，核销前可打开链接；核销后口令一次性耗尽）---\n");
  console.log("TOKEN:\n" + raw);
  console.log("\nURL:\n" + `${base}/guest?t=${encodeURIComponent(raw)}`);
  console.log("\nGuestInvite.id:\n" + invite.id + "\n");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
