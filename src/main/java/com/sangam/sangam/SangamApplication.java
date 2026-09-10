package com.sangam.sangam;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class SangamApplication {

	public static void main(String[] args) {
		SpringApplication.run(SangamApplication.class, args);
	}

}
