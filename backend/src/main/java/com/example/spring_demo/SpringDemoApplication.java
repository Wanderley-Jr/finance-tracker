package com.example.spring_demo;

import com.example.spring_demo.transaction.Transaction;
import com.example.spring_demo.transaction.TransactionRepository;
import com.example.spring_demo.user.User;
import com.example.spring_demo.user.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@SpringBootApplication
public class SpringDemoApplication {

	public static void main(String[] args) {
		SpringApplication.run(SpringDemoApplication.class, args);
	}
}
