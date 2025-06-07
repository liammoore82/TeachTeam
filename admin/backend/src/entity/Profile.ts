import {
  Entity,
  Column,
  OneToMany,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { Pet } from "./Pet";

@Entity()
export class Profile {
  @PrimaryGeneratedColumn({ type: "int" })
  profile_id: number;

  @Column({ type: "varchar", length: 254, unique: true })
  email: string;

  @Column({ type: "varchar", length: 40 })
  first_name: string;

  @Column({ type: "varchar", length: 40 })
  last_name: string;

  @Column({ type: "varchar", length: 12, nullable: true })
  mobile: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  street: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  city: string;

  @Column({ type: "varchar", length: 3, nullable: true })
  state: string;

  @Column({ type: "varchar", length: 4, nullable: true })
  postcode: string;

  @ManyToMany(() => Pet, (pet) => pet.profiles, { eager: true })
  @JoinTable()
  pets: Pet[];
}
