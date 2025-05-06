package com.bank.payment_microservice.service;

import com.bank.payment_microservice.dto.BillRequest;
import com.bank.payment_microservice.model.BillPayment;
import com.bank.payment_microservice.repository.BillPaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class BillPaymentService {

    private final BillPaymentRepository billPaymentRepository;
    private final RestTemplate restTemplate;

    public BillPayment payBill(BillRequest request, String token) {
        String url = "http://ACCOUNT-MICROSERVICE/api/accounts/deduct/" + request.getFromAccountId() + "/" + request.getAmount();

        // Add JWT token to header
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + token);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            restTemplate.exchange(url, HttpMethod.POST, entity, Void.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to deduct amount from account service: " + e.getMessage());
        }

        BillPayment payment = BillPayment.builder()
                .fromAccountId(request.getFromAccountId())
                .category(request.getCategory())
                .amount(request.getAmount())
                .status("SUCCESS")
                .timestamp(LocalDateTime.now())
                .build();

        return billPaymentRepository.save(payment);
    }
}
