-- Indexes for the most frequent read paths: company listing, ranking,
-- review feeds, salary summaries, and moderation relations.

CREATE INDEX "companies_status_name_idx" ON "companies"("status", "name");
CREATE INDEX "companies_status_sector_idx" ON "companies"("status", "sector");
CREATE INDEX "companies_status_city_idx" ON "companies"("status", "city");

CREATE INDEX "establishments_companyId_idx" ON "establishments"("companyId");
CREATE INDEX "departments_companyId_idx" ON "departments"("companyId");

CREATE INDEX "professional_experiences_userId_idx" ON "professional_experiences"("userId");
CREATE INDEX "professional_experiences_companyId_idx" ON "professional_experiences"("companyId");

CREATE INDEX "reviews_companyId_status_publishedAt_idx" ON "reviews"("companyId", "status", "publishedAt");
CREATE INDEX "reviews_status_publishedAt_idx" ON "reviews"("status", "publishedAt");

CREATE INDEX "salary_reports_companyId_idx" ON "salary_reports"("companyId");

CREATE INDEX "verifications_reviewId_status_idx" ON "verifications"("reviewId", "status");

CREATE INDEX "review_responses_reviewId_idx" ON "review_responses"("reviewId");
