package com.bank.login_service.service;

import com.bank.login_service.model.Role;
import com.bank.login_service.model.User;
import com.bank.login_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User register(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }
    
    public List<User> getUsersByRole(String role) {
        return userRepository.findByRole(Role.valueOf(role.toUpperCase()));
    }



}
