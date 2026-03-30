import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Recipient {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  address!: string;

  @Column()
  city!: string;

  @Column()
  state!: string;

  @Column()
  zipcode!: string;

  @Column({ type: "float", nullable: true })
  latitude!: number;

  @Column({ type: "float", nullable: true })
  longitude!: number;
}
