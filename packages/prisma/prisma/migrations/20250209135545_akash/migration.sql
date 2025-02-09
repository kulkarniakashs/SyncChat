-- CreateTable
CREATE TABLE "Users" (
    "userid" TEXT NOT NULL,
    "fullname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "lastOnline" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("userid")
);

-- CreateTable
CREATE TABLE "Groups" (
    "groupid" TEXT NOT NULL,
    "groupName" TEXT NOT NULL,
    "About" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,

    CONSTRAINT "Groups_pkey" PRIMARY KEY ("groupid")
);

-- CreateTable
CREATE TABLE "Memberships" (
    "membershipid" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userid" TEXT NOT NULL,
    "groupid" TEXT NOT NULL,

    CONSTRAINT "Memberships_pkey" PRIMARY KEY ("userid","groupid")
);

-- CreateTable
CREATE TABLE "Messages" (
    "messageid" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "groupid" TEXT NOT NULL,
    "authorid" TEXT NOT NULL,

    CONSTRAINT "Messages_pkey" PRIMARY KEY ("messageid")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- AddForeignKey
ALTER TABLE "Groups" ADD CONSTRAINT "Groups_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Users"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Memberships" ADD CONSTRAINT "Memberships_userid_fkey" FOREIGN KEY ("userid") REFERENCES "Users"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Memberships" ADD CONSTRAINT "Memberships_groupid_fkey" FOREIGN KEY ("groupid") REFERENCES "Groups"("groupid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_groupid_fkey" FOREIGN KEY ("groupid") REFERENCES "Groups"("groupid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_authorid_fkey" FOREIGN KEY ("authorid") REFERENCES "Users"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;
