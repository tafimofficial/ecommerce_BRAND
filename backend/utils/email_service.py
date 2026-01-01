from django.core.mail import send_mail
from django.conf import settings
from threading import Thread

class EmailService:
    @staticmethod
    def _send_async(subject, message, recipient_list):
        try:
            send_mail(
                subject,
                message,
                settings.EMAIL_HOST_USER or 'noreply@luxstore.com',
                recipient_list,
                fail_silently=False,
            )
        except Exception as e:
            print(f"Failed to send email: {e}")

    @staticmethod
    def send_email(subject, message, recipient_list):
        # Run in a separate thread to avoid blocking the main request
        Thread(target=EmailService._send_async, args=(subject, message, recipient_list)).start()

    @staticmethod
    def send_welcome_email(user):
        subject = "Welcome to LuxStore!"
        message = f"Hi {user.full_name},\n\nThank you for creating an account with LuxStore. We are excited to have you!\n\nBest Regards,\nThe LuxStore Team"
        EmailService.send_email(subject, message, [user.email])

    @staticmethod
    def send_order_confirmation(order):
        subject = f"Order Confirmation #{order.id}"
        message = f"Hi {order.full_name},\n\nYour order #{order.id} has been placed successfully.\nTotal Amount: {order.total_price}\n\nWe will notify you once it ships.\n\nThank you for shopping with us!"
        EmailService.send_email(subject, message, [order.email])

    @staticmethod
    def send_order_status_update(order):
        subject = f"Order Update #{order.id}"
        message = f"Hi {order.full_name},\n\nYour order #{order.id} status has been updated to: {order.status}.\n\nTrack your order on our website.\n\nBest,\nLuxStore"
        EmailService.send_email(subject, message, [order.email])

    @staticmethod
    def send_return_status_update(return_request):
        subject = f"Return Request Update #{return_request.id}"
        message = f"Hi {return_request.user.full_name},\n\nYour return request for Order #{return_request.order.id} has been {return_request.status}.\n\nReason for decision: {return_request.admin_note or 'N/A'}\n\nBest,\nLuxStore"
        EmailService.send_email(subject, message, [return_request.user.email])
