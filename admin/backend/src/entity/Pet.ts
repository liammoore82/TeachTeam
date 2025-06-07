import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Profile } from "./Profile";

@Entity()
export class Pet {
  @PrimaryGeneratedColumn({ type: "int" })
  pet_id: number;

  @Column({ type: "varchar", length: 40 })
  name: string;

  @ManyToMany(() => Profile, (profile) => profile.pets)
  profiles: Profile[];
}
