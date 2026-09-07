import * as db from "../db/notifications";

export async function notify(userId: number, type: string, title: string, body?: string, link?: string) {
  return db.createNotification({ userId, type, title, body, link });
}

export async function notifyMany(userIds: number[], type: string, title: string, body?: string, link?: string) {
  return db.bulkCreateNotifications(userIds, type, title, body, link);
}

export async function notifyApplicationUpdate(userId: number, opportunityTitle: string, newStatus: string) {
  const statusMessages: Record<string, string> = {
    shortlisted: "You've been shortlisted for",
    interview: "You've been invited to interview for",
    accepted: "Congratulations! You've been accepted for",
    rejected: "Your application for",
    withdrawn: "Your application for",
  };

  const message = statusMessages[newStatus] ?? `Your application status changed for`;
  const isPositive = ["shortlisted", "interview", "accepted"].includes(newStatus);

  return db.createNotification({
    userId,
    type: "application_update",
    title: `Application ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
    body: `${message} "${opportunityTitle}"`,
    link: "/applications",
    metadata: { newStatus },
  });
}

export async function notifyNewOpportunity(userIds: number[], opportunityType: string, title: string) {
  return db.bulkCreateNotifications(
    userIds,
    "opportunity_new",
    `New ${opportunityType} available`,
    `A new ${opportunityType} "${title}" has been posted.`,
    `/opportunities`
  );
}

export async function notifyNewMessage(userId: number, senderName: string, conversationId: number) {
  return db.createNotification({
    userId,
    type: "message",
    title: `New message from ${senderName}`,
    body: "You have a new message.",
    link: `/messages/${conversationId}`,
  });
}

export async function notifySkillBadge(userId: number, skillName: string, level: string) {
  return db.createNotification({
    userId,
    type: "skill_badge",
    title: `New skill level achieved!`,
    body: `You've reached ${level} level in ${skillName}.`,
    link: "/skills/results",
    metadata: { skillName, level },
  });
}

export async function notifyCollaboration(userId: number, collaborationTitle: string, action: string) {
  return db.createNotification({
    userId,
    type: "collaboration",
    title: `Collaboration ${action}`,
    body: `${collaborationTitle} has been ${action}.`,
    link: "/collaborations",
  });
}
