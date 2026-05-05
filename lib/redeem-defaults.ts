import { prisma } from "@/lib/prisma";

export async function ensureDefaultRedeemItems() {
  const count = await prisma.redeemableItem.count();
  if (count > 0) return;

  await prisma.redeemableItem.createMany({
    data: [
      {
        title: "树苗贴纸包",
        description: "虚拟称号与小树装扮灵感（站内纪念）",
        costCoins: 25,
        iconEmoji: "🌱",
        stock: null,
        active: true,
      },
      {
        title: "回声助力券",
        description: "情绪之海多一次暖心回声机会（记账用）",
        costCoins: 12,
        iconEmoji: "🌊",
        stock: 500,
        active: true,
      },
      {
        title: "灵感加成",
        description: "下次记录灵感额外 +2 情绪币（结算时生效说明）",
        costCoins: 30,
        iconEmoji: "💡",
        stock: null,
        active: true,
      },
    ],
  });
}
