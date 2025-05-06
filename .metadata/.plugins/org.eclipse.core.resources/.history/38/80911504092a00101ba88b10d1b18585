package com.bank.payment_microservice.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long fromAccountId;

    @Enumerated(EnumType.STRING)
    private BillCategory category;

    private Double amount;

    private String status;

    private LocalDateTime timestamp;
}
