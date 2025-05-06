package com.bank.transfer_microservice.service;

import com.bank.transfer_microservice.model.Transfer;
import com.bank.transfer_microservice.repository.TransferRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class TransferService {

    private final TransferRepository transferRepository;
    private final RestTemplate restTemplate;

    @Value("${account.service.url}")
    private String accountServiceUrl;

    public Transfer makeTransfer(Transfer transfer) {
        String deductUrl = accountServiceUrl + "/account/" + transfer.getSenderAccountId() + "/deduct/" + transfer.getAmount();
        restTemplate.put(deductUrl, null); 

        return transferRepository.save(transfer);
    }
}
