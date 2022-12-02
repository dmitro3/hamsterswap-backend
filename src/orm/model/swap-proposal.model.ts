import {
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import {
  SwapProposalEntity,
  SwapProposalStatus,
} from '../../swap/entities/swap-proposal.entity';
import { BaseModel } from '../base.model';
import { SwapItemModel } from './swap-item.model';
import { SwapOptionModel } from './swap-option.model';
import { UserModel } from './user.model';

@Entity({
  name: 'swap_proposal',
})
export class SwapProposalModel extends BaseModel implements SwapProposalEntity {
  @Column({ type: String })
  ownerId: string;

  @ManyToOne(() => UserModel)
  owner: UserModel;

  @Column({ type: String })
  ownerAddress: string;

  @OneToMany(() => SwapItemModel, (item) => item.proposal, {
    cascade: true,
    nullable: true,
  })
  @JoinTable()
  offerItems: SwapItemModel[];

  @OneToMany(() => SwapOptionModel, (option) => option.proposal, {
    cascade: true,
  })
  swapOptions: SwapOptionModel[];

  @Column({ type: String, nullable: true })
  fulfillBy?: string;

  @Column({ type: String, nullable: true })
  fulfilledWithOptionId?: string;

  @Column({ type: 'timestamptz' })
  expiredAt: Date;

  @Column({ type: String, enum: SwapProposalStatus })
  status: SwapProposalStatus;

  @Column({ type: String, default: '' })
  note: string;

  @Column({ type: String, default: '' })
  @Index({ fulltext: true })
  searchText: string;
}
