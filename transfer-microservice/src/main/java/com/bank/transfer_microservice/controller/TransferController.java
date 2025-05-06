package com.bank.transfer_microservice.controller;

import com.bank.transfer_microservice.model.Transfer;
import com.bank.transfer_microservice.service.TransferService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/transfer")
@RequiredArgsConstructor
public class TransferController {

    private final TransferService transferService;

    @PostMapping("/make")
    public Transfer makeTransfer(HttpServletRequest request, @RequestBody Transfer transfer) {
        return transferService.makeTransfer(transfer);
    }
}
