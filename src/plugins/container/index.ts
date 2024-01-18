import ProfileService from "@/application/usecase/profile/profile.service";
import ProfileController from "@/controller/profile/profile.controller";
import MultiTableRepositoryImpl from "@/infrastructure/repositories/multi.table.repository";
import UserRepositoryImpl from "@/infrastructure/repositories/user.reposirory";

const controller = [ProfileController];
const service = [ProfileService];
const repository = [UserRepositoryImpl, MultiTableRepositoryImpl];

export default [...controller, ...service, ...repository];
