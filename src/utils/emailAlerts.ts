export interface EmailAlert {
  id: string;
  triggerType: "PANNE" | "ANOMALIE" | "INTERVENTION" | "DEMANDE_ACHAT";
  recipient: string;
  subject: string;
  message: string;
  details?: {
    equipmentCode?: string;
    equipmentName?: string;
    workshop?: string;
    urgency?: string;
    cost?: number;
    author?: string;
  };
  sentAt: string;
  status: "ENVOYÉ";
}

export interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
}

export const DEFAULT_ALERT_EMAIL_RECIPIENT = "ahmedamineb4@gmail.com";

export function getStoredAlertEmailRecipient(): string {
  try {
    const saved = localStorage.getItem("chery_gmao_alert_email");
    if (saved && saved.trim()) return saved.trim();
  } catch (e) {
    console.warn("Error reading email recipient from localStorage", e);
  }
  return DEFAULT_ALERT_EMAIL_RECIPIENT;
}

export function setStoredAlertEmailRecipient(email: string): string {
  const cleanEmail = email.trim();
  localStorage.setItem("chery_gmao_alert_email", cleanEmail);
  return cleanEmail;
}

export function getStoredSmtpConfig(): SmtpConfig | null {
  try {
    const saved = localStorage.getItem("chery_gmao_smtp_config");
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn("Error reading SMTP config from localStorage", e);
  }
  return null;
}

export function setStoredSmtpConfig(config: SmtpConfig): void {
  localStorage.setItem("chery_gmao_smtp_config", JSON.stringify(config));
}

export function getStoredEmailAlerts(): EmailAlert[] {
  try {
    const saved = localStorage.getItem("chery_gmao_email_alerts");
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn("Error parsing email alerts from localStorage", e);
  }
  return [];
}

export function sendEmailAlert(params: {
  triggerType: "PANNE" | "ANOMALIE" | "INTERVENTION" | "DEMANDE_ACHAT";
  subject: string;
  message: string;
  details?: EmailAlert["details"];
  recipient?: string;
}): EmailAlert {
  const targetRecipient = params.recipient || getStoredAlertEmailRecipient();
  const smtpConfig = getStoredSmtpConfig();

  const newAlert: EmailAlert = {
    id: `MAIL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    triggerType: params.triggerType,
    recipient: targetRecipient,
    subject: params.subject,
    message: params.message,
    details: params.details,
    sentAt: new Date().toISOString(),
    status: "ENVOYÉ"
  };

  const currentAlerts = getStoredEmailAlerts();
  const updated = [newAlert, ...currentAlerts];
  localStorage.setItem("chery_gmao_email_alerts", JSON.stringify(updated.slice(0, 100)));

  // Dispatch custom window event for real-time UI notification banner/toast
  window.dispatchEvent(
    new CustomEvent("chery_email_alert_triggered", {
      detail: newAlert
    })
  );

  // Trigger backend API call for real SMTP email dispatch
  fetch("/api/send-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipient: targetRecipient,
      subject: params.subject,
      message: params.message,
      details: params.details,
      smtpConfig: smtpConfig || undefined
    })
  }).then(res => res.json()).then(data => {
    console.log("[EMAIL DISPATCH RESULT]", data);
  }).catch(err => {
    console.warn("[EMAIL DISPATCH API ERROR]", err);
  });

  return newAlert;
}
