package com.example.spring_demo.transaction;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.query.EscapeCharacter;

import java.time.LocalDate;
import java.util.Locale;

public final class TransactionSpecs {
    private TransactionSpecs() {}

    public static Specification<Transaction> withFilters(
            LocalDate startDate,
            LocalDate endDate,
            String titleQuery,
            String descriptionQuery
    ) {
        String title = EscapeCharacter.DEFAULT.escape(titleQuery);
        String description = EscapeCharacter.DEFAULT.escape(descriptionQuery);

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

        if (title != null && !title.isBlank()) {
            specification = specification.and((root, query, criteriaBuilder) ->
                criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("title")),
                        "%" + title.toLowerCase(Locale.ROOT) + "%",
                        EscapeCharacter.DEFAULT.getEscapeCharacter()
                )
            );
        }

        if (description != null && !description.isBlank()) {
            specification = specification.and((root, query, criteriaBuilder) ->
                criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("description")),
                        "%" + description.toLowerCase(Locale.ROOT) + "%",
                        EscapeCharacter.DEFAULT.getEscapeCharacter()
                )
            );
        }

        return specification;
    }
}
