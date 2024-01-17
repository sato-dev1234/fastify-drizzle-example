import ProfileService from "@/application/usecase/profile/profile.service";
import ProfileController from "@/controller/profile/profile.controller";
import MultiTableRepositoryImpl from "@/infrastructure/repository/multi.table.repository";
import UserRepositoryImpl from "@/infrastructure/repository/user.reposirory";

const controller = [ProfileController];
const service = [ProfileService];
const repository = [UserRepositoryImpl, MultiTableRepositoryImpl];

export default [...controller, ...service, ...repository];
