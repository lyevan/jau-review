import { AccountType } from "@/app/_entities/enums/auth.enum";


export interface AbilityDefinitionParams {
	role?: AccountType;
	user_id?: string;
}
