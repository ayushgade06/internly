-- CreateTable
CREATE TABLE "InterviewLog" (
    "id" TEXT NOT NULL,
    "round" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "experience" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterviewLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "InterviewLog" ADD CONSTRAINT "InterviewLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
