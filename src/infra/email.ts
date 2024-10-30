import { ServiceError } from "@/errors";
import nodemailer, { SendMailOptions } from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SMTP_HOST,
  port: Number(process.env.EMAIL_SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

async function send({ from, to, subject, text }: SendMailOptions) {
  try {
    await transporter.sendMail({ from, to, subject, text });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error);

    throw new ServiceError({
      message: error.message,
      errorLocationCode: "INFRA:EMAIl:SEND",
    });
  }
}

export default Object.freeze({
  send,
});
