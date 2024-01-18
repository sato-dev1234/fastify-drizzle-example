import "reflect-metadata";
import { FastifyRequest } from "fastify";

import ProfileController from "./profile.controller";

import { PrimaryKeySchemaForQuery } from "@/domain/schemas/base.schema";
import { ContactSelectSchema } from "@/domain/schemas/contact/contact.schema";
import {
  ProfileInsertSchema,
  ProfileSelectSchema,
  ProfileUpdateSchema,
} from "@/domain/schemas/profile/profile.schema";
import { UserSelectSchema } from "@/domain/schemas/user/user.schema";

const mockProfileService = {
  create: jest.fn(),
  get: jest.fn(),
  getAll: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

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

describe("ProfileController", () => {
  /* service */
  let profileController: ProfileController;

  beforeEach(() => {
    profileController = new ProfileController();
    Object.defineProperty(profileController, "profileService", {
      value: mockProfileService,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("サービスにリクエスト情報がわたされること", async () => {
      const body: ProfileInsertSchema = {
        user: userSchema,
        contacts: [contactSchemaFirst, contactSchemaSecond],
      };
      const request = { body } as unknown as FastifyRequest<{
        Body: ProfileInsertSchema;
      }>;
      await profileController.create(request);
      expect(mockProfileService.create.mock.calls[0][0]).toStrictEqual(body);
    });
  });

  describe("get", () => {
    it("プロフィール情報が返却されること", async () => {
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
      const expected: ProfileSelectSchema = {
        user: userSelectSchema,
        contacts: [contactSelectSchemaFirst, contactSelectSchemaSecond],
      };
      const request = {
        query: {
          id: 1,
        },
      } as unknown as FastifyRequest<{ Querystring: PrimaryKeySchemaForQuery }>;
      mockProfileService.get.mockResolvedValue(expected);
      const actual: ProfileSelectSchema = await profileController.get(request);
      expect(actual).toStrictEqual(expected);
    });
  });

  describe("getAll", () => {
    it("プロフィール情報が返却されること", async () => {
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
      const expected: ProfileSelectSchema[] = [
        {
          user: userSelectSchema,
          contacts: [contactSelectSchemaFirst, contactSelectSchemaSecond],
        },
      ];
      mockProfileService.getAll.mockResolvedValue(expected);
      const actual: ProfileSelectSchema[] = await profileController.getAll();
      expect(actual).toStrictEqual(expected);
    });
  });

  describe("update", () => {
    it("サービスにリクエスト情報がわたされること", async () => {
      const body: ProfileUpdateSchema = {
        user: { id: 1, ...userSchema },
        contacts: [
          { id: 1, ...contactSchemaFirst },
          { id: 2, ...contactSchemaSecond },
        ],
      };
      const request = { body } as unknown as FastifyRequest<{
        Body: ProfileUpdateSchema;
      }>;
      await profileController.update(request);
      expect(mockProfileService.update.mock.calls[0][0]).toStrictEqual(body);
    });
  });

  describe("delete", () => {
    it("サービスにリクエスト情報がわたされること", async () => {
      const request = {
        query: {
          id: 1,
        },
      } as unknown as FastifyRequest<{ Querystring: PrimaryKeySchemaForQuery }>;
      await profileController.delete(request);
      expect(mockProfileService.delete.mock.calls[0][0]).toStrictEqual(1);
    });
  });
});
