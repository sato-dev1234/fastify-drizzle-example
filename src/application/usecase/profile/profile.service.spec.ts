import "reflect-metadata";
import { SQL, and, eq, isNull } from "drizzle-orm";
import { PgTable } from "drizzle-orm/pg-core";
import { errorCodes } from "fastify";

import ProfileService from "./profile.service";

import {
  ContactInsertSchema,
  ContactSelectSchema,
  ContactUpdateSchema,
} from "@/domain/schemas/contact/contact.schema";
import {
  UserInsertSchema,
  UserSelectSchema,
  UserUpdateSchema,
} from "@/domain/schemas/user/user.schema";
import { ContactEntity, NewContact } from "@/infrastructure/db/contact.schema ";
import { contact, user } from "@/infrastructure/db/schema";
import { UserEntity } from "@/infrastructure/db/user.schema";

const userSchema = {
  firstName: "John",
  lastName: "Doe",
};
const contactSchemaFirst = {
  phoneNumber: "0804567890",
  email: "john@example.com",
};
const contactSchemaSecond = {
  phoneNumber: "0804567891",
  email: "john2@example.com",
};

const baseItems = {
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

const mockMultiTableRepository = {
  insert: jest.fn(),
  update: jest.fn(),
};

const mockUserRepository = {
  findFirst: jest.fn(),
  findMany: jest.fn(),
};

const userCondition = (id: number) =>
  and(eq(user.id, id), isNull(user.deletedAt));
const contactCondition = (id: number) =>
  and(eq(contact.id, id), isNull(contact.deletedAt));

const db = {
  transaction: jest.fn((callback) => callback({})),
} as any;

const testInsertCall = (index: number, table: PgTable, entity: any) => {
  expect(mockMultiTableRepository.insert.mock.calls[index][0]).toStrictEqual(
    {},
  );
  expect(mockMultiTableRepository.insert.mock.calls[index][1]).toStrictEqual(
    table,
  );
  expect(mockMultiTableRepository.insert.mock.calls[index][2]).toStrictEqual(
    entity,
  );
};

const testUpdateCall = (
  index: number,
  table: PgTable,
  entity: any,
  condition?: SQL | undefined,
) => {
  expect(mockMultiTableRepository.update.mock.calls[index][0]).toStrictEqual(
    {},
  );
  expect(mockMultiTableRepository.update.mock.calls[index][1]).toStrictEqual(
    table,
  );
  expect(mockMultiTableRepository.update.mock.calls[index][2]).toStrictEqual(
    entity,
  );
  expect(mockMultiTableRepository.update.mock.calls[index][3]).toStrictEqual(
    condition,
  );
};

/* response */
const userSelectSchema: UserSelectSchema = {
  id: 1,
  ...userSchema,
};
const contactSelectSchemaFirst: ContactSelectSchema = {
  id: 1,
  ...contactSchemaFirst,
};
const contactSelectSchemaSecond: ContactSelectSchema = {
  id: 1,
  ...contactSchemaSecond,
};

/* insert */
const userInsertSchema: UserInsertSchema = userSchema;
const contactInsertSchemaFirst: ContactInsertSchema = contactSchemaFirst;
const contactInsertSchemaSecond: ContactInsertSchema = contactSchemaSecond;

/* entity */
const userEntity: UserEntity = {
  id: 1,
  ...userInsertSchema,
  ...baseItems,
};
const contactEntityFirst: ContactEntity = {
  id: 1,
  userId: 1,
  ...contactInsertSchemaFirst,
  ...baseItems,
};
const contactEntitySecond: ContactEntity = {
  id: 2,
  userId: 1,
  ...contactInsertSchemaSecond,
  ...baseItems,
};

describe("ProfileService", () => {
  /* service */
  let profileService: ProfileService;

  beforeEach(() => {
    profileService = new ProfileService();
    Object.defineProperty(profileService, "db", {
      value: db,
    });
    Object.defineProperty(profileService, "multiTableRepository", {
      value: mockMultiTableRepository,
    });
    Object.defineProperty(profileService, "userRepository", {
      value: mockUserRepository,
    });
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    /* expected */
    const newUser = {
      firstName: userSchema.firstName,
      lastName: userSchema.lastName,
    };
    const newContactFirst: NewContact = {
      phoneNumber: contactSchemaFirst.phoneNumber,
      email: contactSchemaFirst.email,
      userId: 1,
    };
    const newContactSecond: NewContact = {
      phoneNumber: contactSchemaSecond.phoneNumber,
      email: contactSchemaSecond.email,
      userId: 1,
    };
    it("プロフィール情報が登録されること(contact2件)", async () => {
      mockMultiTableRepository.insert
        .mockResolvedValueOnce([userEntity])
        .mockResolvedValueOnce([contactEntityFirst])
        .mockResolvedValueOnce([contactEntitySecond]);
      const contactInsertSchemas: ContactInsertSchema[] = [
        contactInsertSchemaFirst,
        contactInsertSchemaSecond,
      ];
      await profileService.create({
        user: userInsertSchema,
        contacts: contactInsertSchemas,
      });
      expect(mockMultiTableRepository.insert.mock.calls.length).toBe(3);
      testInsertCall(0, user, newUser);
      testInsertCall(1, contact, newContactFirst);
      testInsertCall(2, contact, newContactSecond);
    });
    it("プロフィール情報が登録されること(contact1件)", async () => {
      mockMultiTableRepository.insert
        .mockResolvedValueOnce([userEntity])
        .mockResolvedValueOnce([contactEntityFirst]);
      const contactInsertSchemas: ContactInsertSchema[] = [
        contactInsertSchemaFirst,
      ];
      await profileService.create({
        user: userInsertSchema,
        contacts: contactInsertSchemas,
      });
      expect(mockMultiTableRepository.insert.mock.calls.length).toBe(2);
      testInsertCall(0, user, newUser);
      testInsertCall(1, contact, newContactFirst);
    });
    it("プロフィール情報が登録されること(contact0件)", async () => {
      mockMultiTableRepository.insert.mockResolvedValueOnce([userEntity]);
      const contactInsertSchemas: ContactInsertSchema[] = [];
      await profileService.create({
        user: userInsertSchema,
        contacts: contactInsertSchemas,
      });
      expect(mockMultiTableRepository.insert.mock.calls.length).toBe(1);
      testInsertCall(0, user, newUser);
    });
  });

  describe("get", () => {
    it.each([
      {
        contacts: [contactSelectSchemaFirst, contactSelectSchemaSecond],
        expected: {
          user: userSelectSchema,
          contacts: [contactSelectSchemaFirst, contactSelectSchemaSecond],
        },
        description: "userあり・contact2件",
      },
      {
        contacts: [contactSelectSchemaFirst],
        expected: {
          user: userSelectSchema,
          contacts: [contactSelectSchemaFirst],
        },
        description: "userあり・contact1件",
      },
      {
        contacts: [],
        expected: { user: userSelectSchema, contacts: [] },
        description: "userあり・contactなし",
      },
    ])(
      "プロフィール情報が返却されること($description)",
      async ({ contacts, expected }) => {
        mockUserRepository.findFirst.mockResolvedValueOnce({
          user: {
            ...userSelectSchema,
          },
          contacts,
        });
        const result = await profileService.get(1);
        expect(result).toStrictEqual(expected);
      },
    );
    describe("異常系", () => {
      it("プロフィール情報が取得できなかった場合Not Found", async () => {
        mockUserRepository.findFirst.mockResolvedValueOnce(undefined);
        await expect(profileService.get(1)).rejects.toThrow(
          new errorCodes.FST_ERR_NOT_FOUND(),
        );
      });
    });
  });

  describe("getAll", () => {
    describe("正常系", () => {
      it.each([
        {
          contacts: [contactSelectSchemaFirst, contactSelectSchemaSecond],
          expected: [
            {
              user: userSelectSchema,
              contacts: [contactSelectSchemaFirst, contactSelectSchemaSecond],
            },
          ],
          description: "userあり・contact2件",
        },
        {
          contacts: [contactSelectSchemaFirst],
          expected: [
            { user: userSelectSchema, contacts: [contactSelectSchemaFirst] },
          ],
          description: "userあり・contact1件",
        },
        {
          contacts: [],
          expected: [{ user: userSelectSchema, contacts: [] }],
          description: "userあり・contactなし",
        },
      ])(
        "プロフィール情報が返却されること($description)",
        async ({ contacts, expected }) => {
          mockUserRepository.findMany.mockResolvedValueOnce([
            {
              user: {
                ...userSelectSchema,
              },
              contacts,
            },
          ]);
          const result = await profileService.getAll();
          expect(result).toStrictEqual(expected);
        },
      );
    });
  });

  describe("update", () => {
    /* request */
    const userUpdateSchema: UserUpdateSchema = { id: 1, ...userSchema };
    const contactUpdateSchemaFirst: ContactUpdateSchema = {
      id: 1,
      ...contactSchemaFirst,
    };
    const contactUpdateSchemaSecond: ContactUpdateSchema = {
      id: 2,
      ...contactSchemaSecond,
    };
    /* expected */
    const newUser = {
      firstName: userSchema.firstName,
      lastName: userSchema.lastName,
    };
    const updateContactFirst = {
      phoneNumber: contactSchemaFirst.phoneNumber,
      email: contactSchemaFirst.email,
    };
    const updateContactSecond = {
      phoneNumber: contactSchemaSecond.phoneNumber,
      email: contactSchemaSecond.email,
    };
    describe("正常系", () => {
      beforeEach(() => {
        mockUserRepository.findFirst.mockResolvedValueOnce({
          user: {
            id: 1,
            ...userSchema,
          },
          contacts: [
            {
              id: 1,
              ...contactSchemaFirst,
            },
          ],
        });
      });
      it("プロフィール情報が更新されること(contact2件)", async () => {
        mockMultiTableRepository.update
          .mockResolvedValueOnce([userEntity])
          .mockResolvedValueOnce([contactEntityFirst])
          .mockResolvedValueOnce([contactEntitySecond]);
        const contactUpdateSchemas: ContactUpdateSchema[] = [
          contactUpdateSchemaFirst,
          contactUpdateSchemaSecond,
        ];
        await profileService.update({
          user: userUpdateSchema,
          contacts: contactUpdateSchemas,
        });
        expect(mockMultiTableRepository.update.mock.calls.length).toBe(3);
        testUpdateCall(0, user, newUser, userCondition(userUpdateSchema.id));
        testUpdateCall(
          1,
          contact,
          updateContactFirst,
          contactCondition(contactUpdateSchemaFirst.id),
        );
        testUpdateCall(
          2,
          contact,
          updateContactSecond,
          contactCondition(contactUpdateSchemaSecond.id),
        );
      });
      it("プロフィール情報が更新されること(contact1件)", async () => {
        mockMultiTableRepository.update
          .mockResolvedValueOnce([userEntity])
          .mockResolvedValueOnce([contactEntityFirst]);
        const contactUpdateSchemas: ContactUpdateSchema[] = [
          contactUpdateSchemaFirst,
        ];
        await profileService.update({
          user: userUpdateSchema,
          contacts: contactUpdateSchemas,
        });
        expect(mockMultiTableRepository.update.mock.calls.length).toBe(2);
        testUpdateCall(0, user, newUser, userCondition(userUpdateSchema.id));
        testUpdateCall(
          1,
          contact,
          updateContactFirst,
          contactCondition(contactUpdateSchemaFirst.id),
        );
      });
      it("プロフィール情報が更新されること(contact0件)", async () => {
        mockMultiTableRepository.update.mockResolvedValueOnce([userEntity]);
        const contactUpdateSchemas: ContactUpdateSchema[] = [];
        await profileService.update({
          user: userUpdateSchema,
          contacts: contactUpdateSchemas,
        });
        expect(mockMultiTableRepository.update.mock.calls.length).toBe(1);
        testUpdateCall(0, user, newUser, userCondition(userUpdateSchema.id));
      });
    });
    describe("異常系", () => {
      it("プロフィール情報が取得できなかった場合Not Found", async () => {
        mockUserRepository.findFirst.mockResolvedValueOnce(undefined);
        await expect(
          profileService.update({
            user: userUpdateSchema,
            contacts: [contactUpdateSchemaFirst],
          }),
        ).rejects.toThrow(new errorCodes.FST_ERR_NOT_FOUND());
      });
    });
  });

  describe("delete", () => {
    /* request */
    const userUpdateSchema: UserUpdateSchema = { id: 1, ...userSchema };
    describe("正常系", () => {
      it("プロフィール情報が削除されること(contact2件)", async () => {
        mockMultiTableRepository.update
          .mockResolvedValueOnce([userEntity])
          .mockResolvedValueOnce([contactEntityFirst])
          .mockResolvedValueOnce([contactEntitySecond]);
        mockUserRepository.findFirst.mockResolvedValueOnce({
          ...userEntity,
          contacts: [contactEntityFirst, contactEntitySecond],
        });
        const deletedAt = new Date();
        await profileService.delete(userUpdateSchema.id, deletedAt);
        expect(mockMultiTableRepository.update.mock.calls.length).toBe(3);
        testUpdateCall(
          0,
          user,
          { deletedAt },
          userCondition(userUpdateSchema.id),
        );
        testUpdateCall(
          1,
          contact,
          { deletedAt },
          contactCondition(contactEntityFirst.id),
        );
        testUpdateCall(
          2,
          contact,
          { deletedAt },
          contactCondition(contactEntitySecond.id),
        );
      });
      it("プロフィール情報が削除されること(contact1件)", async () => {
        mockMultiTableRepository.update
          .mockResolvedValueOnce([userEntity])
          .mockResolvedValueOnce([contactEntityFirst]);
        mockUserRepository.findFirst.mockResolvedValueOnce({
          ...userEntity,
          contacts: [contactEntityFirst],
        });
        const deletedAt = new Date();
        await profileService.delete(userUpdateSchema.id, deletedAt);
        expect(mockMultiTableRepository.update.mock.calls.length).toBe(2);
        testUpdateCall(
          0,
          user,
          { deletedAt },
          userCondition(userUpdateSchema.id),
        );
        testUpdateCall(
          1,
          contact,
          { deletedAt },
          contactCondition(contactEntityFirst.id),
        );
      });
      it("プロフィール情報が削除されること(contact0件)", async () => {
        mockMultiTableRepository.update.mockResolvedValueOnce([userEntity]);
        mockUserRepository.findFirst.mockResolvedValueOnce({
          ...userEntity,
          contacts: [],
        });
        const deletedAt = new Date();
        await profileService.delete(userUpdateSchema.id, deletedAt);
        expect(mockMultiTableRepository.update.mock.calls.length).toBe(1);
        testUpdateCall(
          0,
          user,
          { deletedAt },
          userCondition(userUpdateSchema.id),
        );
      });
    });
    describe("異常系", () => {
      it("プロフィール情報が取得できなかった場合Not Found", async () => {
        mockUserRepository.findFirst.mockResolvedValueOnce(undefined);
        await expect(profileService.delete(1)).rejects.toThrow(
          new errorCodes.FST_ERR_NOT_FOUND(),
        );
      });
    });
  });
});
