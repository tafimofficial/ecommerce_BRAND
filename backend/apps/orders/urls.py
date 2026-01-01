from django.urls import path
from .views import init_payment, payment_success, payment_fail, payment_cancel

urlpatterns = [
    path('init/', init_payment, name='init_payment'),
    path('success/', payment_success, name='payment_success'),
    path('fail/', payment_fail, name='payment_fail'),
    path('cancel/', payment_cancel, name='payment_cancel'),
]
