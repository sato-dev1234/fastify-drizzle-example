import "reflect-metadata";
import * as nodePotgres from "drizzle-orm/node-postgres";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import UserRepositoryImpl from "./user.reposirory";

import { ContactSelectSchema } from "@/domain/schemas/contact/contact.schema";
import { UserSelectSchema } from "@/domain/schemas/user/user.schema";
import { ContactEntity } from "@/infrastructure/db/contact.schema ";
import { UserEntity } from "@/infrastructure/db/user.schema";

jest.mock("drizzle-orm/node-postgres");

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

const baseColumns = {
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

const mockUser = {
  findMany: jest.fn(),
  findFirst: jest.fn(),
};

const mockQuery = {
  user: mockUser,
};

const mockDb: NodePgDatabase<Record<string, unknown>> = {
  query: mockQuery,
} as unknown as NodePgDatabase<Record<string, unknown>>;
const nodePotgresMock = nodePotgres as jest.Mocked<typeof nodePotgres>;

const app = {
  pg: jest.fn(),
} as any;

describe("UserRepositoryImpl", () => {
  /* service */
  let userRepositoryImpl: UserRepositoryImpl;

  beforeEach(() => {
    nodePotgresMock.drizzle.mockReturnValue(mockDb);
    userRepositoryImpl = new UserRepositoryImpl(app);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("get", () => {
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
      id: 2,
      ...contactSchemaSecond,
    };
    /* entity */
    const userEntity: UserEntity = {
      id: 1,
      ...userSchema,
      ...baseColumns,
    };
    const contactEntityFirst: ContactEntity = {
      id: 1,
      userId: 1,
      ...contactSchemaFirst,
      ...baseColumns,
    };
    const contactEntitySecond: ContactEntity = {
      id: 2,
      userId: 1,
      ...contactSchemaSecond,
      ...baseColumns,
    };
    it.each([
      {
        contacts: [contactEntityFirst, contactEntitySecond],
        expected: {
          user: userSelectSchema,
          contacts: [contactSelectSchemaFirst, contactSelectSchemaSecond],
        },
        description: "userあり・contact2件",
      },
      {
        contacts: [contactEntityFirst],
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
        mockUser.findFirst.mockResolvedValueOnce({
          ...userEntity,
          contacts,
        });
        const result = await userRepositoryImpl.findFirst(1);
        expect(result).toStrictEqual(expected);
      },
    );
    it("プロフィール情報が取得できなかった場合undefinedが返されること", async () => {
      mockUser.findFirst.mockResolvedValueOnce(undefined);
      const result = await userRepositoryImpl.findFirst(1);
      expect(result).toBeUndefined();
    });
  });

  describe("getAll", () => {
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
      id: 2,
      ...contactSchemaSecond,
    };
    /* entity */
    const userEntity: UserEntity = {
      id: 1,
      ...userSchema,
      ...baseColumns,
    };
    const contactEntityFirst: ContactEntity = {
      id: 1,
      userId: 1,
      ...contactSchemaFirst,
      ...baseColumns,
    };
    const contactEntitySecond: ContactEntity = {
      id: 2,
      userId: 1,
      ...contactSchemaSecond,
      ...baseColumns,
    };
    describe("正常系", () => {
      it.each([
        {
          contacts: [contactEntityFirst, contactEntitySecond],
          expected: [
            {
              user: userSelectSchema,
              contacts: [contactSelectSchemaFirst, contactSelectSchemaSecond],
            },
          ],
          description: "userあり・contact2件",
        },
        {
          contacts: [contactEntityFirst],
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
          mockUser.findMany.mockResolvedValueOnce([
            {
              ...userEntity,
              contacts,
            },
          ]);
          const result = await userRepositoryImpl.findMany();
          expect(result).toStrictEqual(expected);
        },
      );
      it("プロフィール情報が取得できなかった場合、空配列が返されること", async () => {
        mockUser.findMany.mockResolvedValueOnce(undefined);
        const result = await userRepositoryImpl.findMany();
        expect(result).toStrictEqual([]);
      });
    });
  });
});
