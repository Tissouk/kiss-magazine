// lib/loyalty.ts
export const POINT_RATES = {
  PURCHASE: 1, // 1 point per $1
  REVIEW_WITH_PHOTO: 50,
  COMMENT: 5,
  TRY_ON_PHOTO: 100,
  DAILY_LOGIN: 2,
  REFERRAL: 200,
  CULTURE_QUIZ: 25,
  SOCIAL_SHARE: 15,
};

export async function awardPoints(
  userId: string, 
  actionType: keyof typeof POINT_RATES,
  amount?: number
) {
  const points = amount || POINT_RATES[actionType];
  
  await db.loyaltyPointsTransactions.create({
    data: {
      userId,
      points,
      transactionType: 'earn',
      description: `Points earned for ${actionType}`,
    },
  });
  
  await db.users.update({
    where: { id: userId },
    data: {
      points: { increment: points },
    },
  });
}