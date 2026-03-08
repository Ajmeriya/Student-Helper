package com.studenthelper.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Service;

@Service
public class EmailVerificationService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:${MAIL_FROM:no-reply@studenthelper.local}}")
    private String fromEmail;

    public void sendVerificationCode(String toEmail, String code) {
        // Gmail app passwords are often copied with spaces; normalize to avoid auth failures.
        if (mailSender instanceof JavaMailSenderImpl senderImpl) {
            String username = senderImpl.getUsername();
            String password = senderImpl.getPassword();

            if (username != null) {
                senderImpl.setUsername(username.trim());
            }
            if (password != null) {
                senderImpl.setPassword(password.replaceAll("\\s+", ""));
            }
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Student Helper Email Verification Code");
        message.setText(buildMessage(code));
        mailSender.send(message);
    }

    public void sendPasswordResetCode(String toEmail, String code) {
        // Gmail app passwords are often copied with spaces; normalize to avoid auth failures.
        if (mailSender instanceof JavaMailSenderImpl senderImpl) {
            String username = senderImpl.getUsername();
            String password = senderImpl.getPassword();

            if (username != null) {
                senderImpl.setUsername(username.trim());
            }
            if (password != null) {
                senderImpl.setPassword(password.replaceAll("\\s+", ""));
            }
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Student Helper Password Reset Code");
        message.setText(buildPasswordResetMessage(code));
        mailSender.send(message);
    }

    private String buildMessage(String code) {
        return "Welcome to Student Helper!\n\n"
                + "Your verification code is: " + code + "\n"
                + "This code expires in 15 minutes.\n\n"
                + "If you did not request this, please ignore this email.";
    }

    private String buildPasswordResetMessage(String code) {
        return "Student Helper Password Reset\n\n"
                + "Your password reset code is: " + code + "\n"
                + "This code expires in 15 minutes.\n\n"
                + "If you did not request this, please ignore this email.";
    }
}
