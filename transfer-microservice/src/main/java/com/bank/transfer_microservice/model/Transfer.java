package com.bank.transfer_microservice.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transfer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long senderAccountId;

    private String recipientName;

    private String recipientAccountNumber;

    private Double amount;

    private String description;

    private String status; // SUCCESS or FAILED
}
