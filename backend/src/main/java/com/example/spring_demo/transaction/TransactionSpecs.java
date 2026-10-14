package com.example.spring_demo.transaction;

import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public final class TransactionSpecs {
    private TransactionSpecs() {}

    public static Specification<Transaction> withFilters(
            LocalDate startDate,
            LocalDate endDate,
            String titleQuery,
            String descriptionQuery
    ) {
        Specification<Transaction> specification =
                (root, query, criteriaBuilder) ->
                        criteriaBuilder.conjunction();

        if (startDate != null) {
            specification = specification.and((root, query, criteriaBuilder) ->
                criteriaBuilder.greaterThanOrEqualTo(root.get("date"), startDate)
            );
        }

        if (endDate != null) {
            specification = specification.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.lessThanOrEqualTo(root.get("date"), endDate)
            );
        }

        if (titleQuery != null && !titleQuery.isBlank()) {
            specification = specification.and((root, query, criteriaBuilder) ->
                criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("title")),
                        "%" + titleQuery.toLowerCase() + "%"
                )
            );
        }

        if (descriptionQuery != null && !descriptionQuery.isBlank()) {
            specification = specification.and((root, query, criteriaBuilder) ->
                criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("description")),
                        "%" + descriptionQuery.toLowerCase() + "%"
                )
            );
        }

        return specification;
    }
}
