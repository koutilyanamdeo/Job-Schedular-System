import { prisma } from "../lib/prisma.ts";

export class UserService{
    
    static async registerUser(userData:{ name: string, email:string, password:string, phoneNumber: any}) {
        return prisma.user.create({ data : userData})
    }

    static async findOne(email: string){
        return prisma.user.findUnique({where :{ email }})
    }

    static async updateUser (id:string , userData:any){
        return prisma.user.update({where:{id:id}, data:userData})
    }

    static async deleteUser(id:string){
        return prisma.user.delete({where:{id:id}})
    }
}

