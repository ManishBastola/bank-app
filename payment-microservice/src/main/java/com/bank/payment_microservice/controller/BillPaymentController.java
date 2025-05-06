package com.bank.payment_microservice.controller;

import com.bank.payment_microservice.dto.BillRequest;
import com.bank.payment_microservice.model.BillPayment;
import com.bank.payment_microservice.service.BillPaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bills")
@RequiredArgsConstructor
public class BillPaymentController {

    private final BillPaymentService billPaymentService;

    @PostMapping("/pay")
    public ResponseEntity<BillPayment> payBill(@RequestBody BillRequest request,
                                               @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        BillPayment payment = billPaymentService.payBill(request, token);
        return ResponseEntity.ok(payment);
    }
}
