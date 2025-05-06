package com.bank.payment_microservice.repository;

import com.bank.payment_microservice.model.BillPayment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BillPaymentRepository extends JpaRepository<BillPayment, Long> {
}
