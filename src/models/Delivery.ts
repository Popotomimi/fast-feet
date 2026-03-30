import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { User } from "./User";
import { Recipient } from "./Recipient";

export enum DeliveryStatus {
  PENDING = "pending",
  WAITING = "waiting",
  PICKED_UP = "picked_up",
  DELIVERED = "delivered",
  RETURNED = "returned",
}

@Entity()
export class Delivery {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User)
  deliveryman!: User;

  @ManyToOne(() => Recipient)
  recipient!: Recipient;

  @Column({
    type: "enum",
    enum: DeliveryStatus,
    default: DeliveryStatus.PENDING,
  })
  status!: DeliveryStatus;

  @Column({ nullable: true })
  proofPhoto!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: "timestamp", nullable: true })
  pickedUpAt!: Date;

  @Column({ type: "timestamp", nullable: true })
  deliveredAt!: Date;

  @ManyToOne(() => User, { nullable: true })
  pickedUpBy!: User | null;
}
