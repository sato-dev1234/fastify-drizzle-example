import { eq } from "drizzle-orm";
import { NodePgDatabase, drizzle } from "drizzle-orm/node-postgres";
import request from "supertest";

import App from "@/app";
import { setup } from "@/app.setup";
import { ValidationError } from "@/domain/error/validation.error";
import { ContactInsertSchema } from "@/domain/schemas/contact/contact.schema";
import { UserInsertSchema } from "@/domain/schemas/user/user.schema";
import { ContactEntity, NewContact } from "@/infrastructure/db/contact.schema ";
import { contact, user } from "@/infrastructure/db/schema";
import { UserEntity } from "@/infrastructure/db/user.schema";
import plugins from "@/plugins";
import routes from "@/routes";
import {
  assertNotFoundError,
  assertValidationError,
} from "~/jest-e2e-assertion";
import { client } from "~/jest-e2e.setup";

const userEntity = {
  firstName: "John",
  lastName: "Doe",
};

const contactEntities = [
  {
    phoneNumber: "0804567890",
    email: "john@example.com",
  },
  {
    phoneNumber: "0804567891",
    email: "john2@example.com",
  },
];

type TestProfile = {
  registeredUsers: UserEntity[];
  registeredContacts: ContactEntity[];
};

const insertProfile = async (
  userSchema: UserInsertSchema,
  contactSchemas: ContactInsertSchema[],
): Promise<TestProfile> => {
  const db: NodePgDatabase = drizzle(client);
  const registeredUsers: UserEntity[] = [];
  const registeredContacts: ContactEntity[] = [];
  await db.transaction(async (tx) => {
    const [registeredUserEntity]: UserEntity[] = await tx
      .insert(user)
      .values(userSchema)
      .returning();
    registeredUsers.push(registeredUserEntity);
    await Promise.all(
      contactSchemas.map(async ({ phoneNumber, email }) => {
        const newContact: NewContact = {
          phoneNumber,
          email,
          userId: registeredUserEntity.id,
        };
        const [registeredContact]: ContactEntity[] = await tx
          .insert(contact)
          .values(newContact)
          .returning();
        registeredContacts.push(registeredContact);
      }),
    );
  });
  return { registeredUsers, registeredContacts };
};

describe("/profile", () => {
  const app = new App();

  beforeAll(async () => {
    await setup(app.fastify, plugins, routes);
    await app.listen();
  });

  afterAll(async () => {
    await app.fastify.close();
  });

  describe("POST /profile/create", () => {
    describe("正常系", () => {
      it("プロフィールが登録されること", async () => {
        const profileRequest = {
          user: userEntity,
          contacts: contactEntities,
        };
        await request(app.fastify.server)
          .post("/profile/create")
          .send(profileRequest)
          .set("Accept", "application/json")
          .expect(201)
          .then((response) => {
            expect(response.body).toEqual({});
          })
          .catch((err) => {
            throw err;
          });
      });
    });
    describe("異常系", () => {
      it.each([
        {
          description: "必須",
          contacts: [{}],
          issues: [
            {
              path: ["contacts", 0, "phoneNumber"],
              message: "必須",
            },
          ],
        },
        {
          description: "不正",
          contacts: [{ phoneNumber: "1114567890", email: "johnexample.com" }],
          issues: [
            {
              path: ["contacts", 0, "phoneNumber"],
              message: "利用できない電話番号が入力されました。",
            },
            {
              path: ["contacts", 0, "email"],
              message: "メールアドレスの形式で入力してください。",
            },
          ],
        },
      ])(
        "contactsでバリデーションエラーが発生すること($description)",
        async ({ contacts, issues }) => {
          const profileRequest = { user: userEntity, contacts };
          await request(app.fastify.server)
            .post("/profile/create")
            .send(profileRequest)
            .set("Accept", "application/json")
            .expect(400)
            .then((response) => {
              const validationError: ValidationError = response.body;
              assertValidationError(validationError, issues);
            })
            .catch((err) => {
              throw err;
            });
        },
      );
    });
  });

  describe("GET /profile/getAll", () => {
    describe("正常系", () => {
      it("プロフィールが取得できること", async () => {
        const testProfile = await insertProfile(userEntity, contactEntities);
        await request(app.fastify.server)
          .get("/profile/getAll")
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .then((response) => {
            expect(response.body.profile[0].user).toStrictEqual({
              id: testProfile.registeredUsers[0].id,
              ...userEntity,
            });
            expect(response.body.profile[0].contacts).toStrictEqual([
              {
                id: testProfile.registeredContacts[0].id,
                ...contactEntities[0],
              },
              {
                id: testProfile.registeredContacts[1].id,
                ...contactEntities[1],
              },
            ]);
          })
          .catch((err) => {
            throw err;
          });
      });
    });
  });

  describe("GET /profile/get", () => {
    describe("正常系", () => {
      it("idを指定していない場合にバリデーションエラー", async () => {
        await request(app.fastify.server)
          .get("/profile/get")
          .expect(400)
          .then(async (response) => {
            const validationError: ValidationError = response.body;
            const issues = [
              {
                path: ["id"],
                message: "必須",
              },
            ];
            assertValidationError(validationError, issues);
          });
      });
      it("idが数値じゃない場合にバリデーションエラー", async () => {
        await request(app.fastify.server)
          .get("/profile/get")
          .query(`id=a`)
          .expect(400)
          .then(async (response) => {
            const validationError: ValidationError = response.body;
            const issues = [
              {
                path: ["id"],
                message:
                  "数値での入力を期待していますが、文字列が入力されました。",
              },
            ];
            assertValidationError(validationError, issues);
          });
      });
      it("プロフィール情報が取得できなかった場合Not Found", async () => {
        await request(app.fastify.server)
          .get("/profile/get")
          .query(`id=1`)
          .expect(404)
          .then((response) => {
            assertNotFoundError(response.body);
          })
          .catch((err) => {
            throw err;
          });
      });
    });
  });

  describe("PUT /profile/update", () => {
    describe("正常系", () => {
      it("プロフィールが更新されること", async () => {
        const testProfile: TestProfile = await insertProfile(
          userEntity,
          contactEntities,
        );
        const userId = testProfile.registeredUsers[0].id;
        const contactIdFirst = testProfile.registeredContacts[0].id;
        const contactIdSecond = testProfile.registeredContacts[1].id;
        const updateUserEntity = {
          id: userId,
          firstName: "Updated John",
          lastName: "Updated Doe",
        };
        const updateContactEntities = [
          {
            id: contactIdFirst,
            phoneNumber: "0804567890",
            email: "updated_john@example.com",
          },
          {
            id: contactIdSecond,
            phoneNumber: "0804567891",
            email: "updated_john2@example.com",
          },
        ];
        const profileRequest = {
          user: updateUserEntity,
          contacts: updateContactEntities,
        };
        await request(app.fastify.server)
          .put("/profile/update")
          .send(profileRequest)
          .set("Accept", "application/json")
          .expect(204)
          .then(async () => {
            const db: NodePgDatabase = drizzle(client);
            const [updatedUserEntity]: UserEntity[] = await db
              .select()
              .from(user)
              .where(eq(user.id, userId));
            const updatedContactEntities = await db
              .select()
              .from(contact)
              .where(eq(contact.userId, userId));
            const {
              id: _actualUserId,
              createdAt: _actualCreatedAt,
              updatedAt: _actualUpdateAt,
              deletedAt: _actualDeletedAt,
              ...actualUser
            } = updatedUserEntity;
            const { id: _expectedUserId, ...expectedUser } = updateUserEntity;
            const actualContacts = updatedContactEntities.map(
              (updatedContactEntity) => {
                const {
                  id: _actualContactId,
                  userId: _actualContactUserId,
                  createdAt: _actualContactCreatedAt,
                  updatedAt: _actualContactUpdateAt,
                  deletedAt: _actualContactDeletedAt,
                  ...actualContact
                } = updatedContactEntity;
                return actualContact;
              },
            );
            const expectedContacts = updateContactEntities.map(
              (contactEntity) => {
                const { id: _expectedContactId, ...expectedContact } =
                  contactEntity;
                return expectedContact;
              },
            );
            expect(actualUser).toStrictEqual(expectedUser);
            expect(actualContacts).toStrictEqual(expectedContacts);
          })
          .catch((err) => {
            throw err;
          });
      });
    });
    describe("異常系", () => {
      it.each([
        {
          description: "必須",
          contacts: [{}],
          issues: [
            {
              path: ["contacts", 0, "id"],
              message: "必須",
            },
            {
              path: ["contacts", 0, "phoneNumber"],
              message: "必須",
            },
          ],
        },
        {
          description: "不正",
          contacts: [
            { id: "a", phoneNumber: "1114567890", email: "johnexample.com" },
          ],
          issues: [
            {
              path: ["contacts", 0, "id"],
              message:
                "数値での入力を期待していますが、文字列が入力されました。",
            },
            {
              path: ["contacts", 0, "phoneNumber"],
              message: "利用できない電話番号が入力されました。",
            },
            {
              path: ["contacts", 0, "email"],
              message: "メールアドレスの形式で入力してください。",
            },
          ],
        },
      ])(
        "contactsでバリデーションエラーが発生すること($description)",
        async ({ contacts, issues }) => {
          const profileRequest = { user: { id: 1, ...userEntity }, contacts };
          await request(app.fastify.server)
            .put("/profile/update")
            .send(profileRequest)
            .set("Accept", "application/json")
            .expect(400)
            .then((response) => {
              const validationError: ValidationError = response.body;
              assertValidationError(validationError, issues);
            })
            .catch((err) => {
              throw err;
            });
        },
      );
      it("更新対象のユーザーが存在しない場合Not Found", async () => {
        const profileRequest = { user: { id: 1, ...userEntity }, contacts: [] };
        await request(app.fastify.server)
          .put("/profile/update")
          .send(profileRequest)
          .set("Accept", "application/json")
          .expect(404)
          .then((response) => {
            assertNotFoundError(response.body);
          })
          .catch((err) => {
            throw err;
          });
      });
    });
  });

  describe("DELETE /profile/delete", () => {
    describe("正常系", () => {
      it("プロフィールが削除されること", async () => {
        const testProfile: TestProfile = await insertProfile(
          userEntity,
          contactEntities,
        );
        const userId = testProfile.registeredUsers[0].id;
        await request(app.fastify.server)
          .delete("/profile/delete")
          .query(`id=${userId}`)
          .expect(204)
          .then(async () => {
            const db: NodePgDatabase = drizzle(client);
            const [deletedUserEntity]: UserEntity[] = await db
              .select()
              .from(user)
              .where(eq(user.id, userId));
            const deletedContactEntities = await db
              .select()
              .from(contact)
              .where(eq(contact.userId, userId));
            expect(deletedUserEntity.deletedAt).not.toBeUndefined();
            deletedContactEntities.forEach(
              (deletedContactEntity: ContactEntity) => {
                expect(deletedContactEntity.deletedAt).not.toBeUndefined();
              },
            );
          })
          .catch((err) => {
            throw err;
          });
      });
    });
    describe("異常系", () => {
      it("idを指定していない場合にバリデーションエラー", async () => {
        await request(app.fastify.server)
          .delete("/profile/delete")
          .expect(400)
          .then(async (response) => {
            const validationError: ValidationError = response.body;
            const issues = [
              {
                path: ["id"],
                message: "必須",
              },
            ];
            assertValidationError(validationError, issues);
          });
      });
      it("idが数値じゃない場合にバリデーションエラー", async () => {
        await request(app.fastify.server)
          .delete("/profile/delete")
          .query(`id=a`)
          .expect(400)
          .then(async (response) => {
            const validationError: ValidationError = response.body;
            const issues = [
              {
                path: ["id"],
                message:
                  "数値での入力を期待していますが、文字列が入力されました。",
              },
            ];
            assertValidationError(validationError, issues);
          });
      });
      it("プロフィール情報が取得できなかった場合Not Found", async () => {
        await request(app.fastify.server)
          .delete("/profile/delete")
          .query(`id=1`)
          .expect(404)
          .then((response) => {
            assertNotFoundError(response.body);
          })
          .catch((err) => {
            throw err;
          });
      });
    });
  });
});
