import { Certificate } from '@prisma/client'
import { CertificateRepository } from '../../../repositories/certificate-repository'
import { CertificateTemplateRepository } from '../../../repositories/certificate-template-repository'
import { IUsersRepository } from '../../../repositories/users-repository'
import { IUserCareerRepository } from '../../../repositories/user-career-repository'
import { ICareerRepository } from '../../../repositories/career-repository'
import { UserNotFoundError } from '../../errors/user-not-found'
import { CareerNotFoundError } from '../../errors/career-not-found'
import { CareerCertificateNotEligibleError } from '../../errors/career-certificate-not-eligible'
import { evaluateCareerCertificationReadiness } from '../Career/career-certification-readiness'
import { NotificationBuilder } from '../../../utils/notification-builder'
import { createNotification } from '../../../utils/create-notification'

export interface CreateCareerCertificateUseCaseRequest {
  userId: string
  careerId: string
  templateId?: string
}

export interface CreateCareerCertificateUseCaseResponse {
  certificate: Certificate
}

export class CreateCareerCertificateUseCase {
  constructor(
    private certificateRepository: CertificateRepository,
    private certificateTemplateRepository: CertificateTemplateRepository,
    private usersRepository: IUsersRepository,
    private userCareerRepository: IUserCareerRepository,
    private careerRepository: ICareerRepository,
  ) {}

  async execute({
    userId,
    careerId,
    templateId,
  }: CreateCareerCertificateUseCaseRequest): Promise<CreateCareerCertificateUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)
    if (!user) {
      throw new UserNotFoundError()
    }

    const career = await this.careerRepository.findById(careerId)
    if (!career) {
      throw new CareerNotFoundError()
    }

    const userCareer = await this.userCareerRepository.findByUserAndCareer(
      userId,
      careerId,
    )
    if (!userCareer) {
      throw new CareerNotFoundError()
    }
    const readiness = await evaluateCareerCertificationReadiness(userId, careerId)
    if (!readiness.finalExamClearedAt) {
      throw new CareerCertificateNotEligibleError(
        'Exame final ainda não foi liberado. Aguarde a aprovação da solicitação.',
      )
    }
    if (!readiness.onlineTrackComplete) {
      throw new CareerCertificateNotEligibleError(
        'Conclua todos os cursos (100%) e exames com nota mínima para emitir o certificado.',
      )
    }

    const existing = await this.certificateRepository.findByUserIdAndCareerId(
      userId,
      careerId,
    )
    if (existing) {
      return { certificate: existing }
    }

    let resolvedTemplateId = templateId
    if (!resolvedTemplateId) {
      const defaultTemplate =
        await this.certificateTemplateRepository.findDefault()
      resolvedTemplateId = defaultTemplate?.id
    }

    const certificate = await this.certificateRepository.create({
      user: { connect: { id: userId } },
      career: { connect: { id: careerId } },
      ...(resolvedTemplateId && {
        template: { connect: { id: resolvedTemplateId } },
      }),
    })

    try {
      const notificationData =
        NotificationBuilder.createCareerCertificateNotification(userId, {
          certificateId: certificate.id,
          careerId: career.id,
          careerTitle: career.title,
        })
      await createNotification(notificationData)
    } catch (error) {
      console.error('Erro ao criar notificação de certificado de carreira:', error)
    }

    return { certificate }
  }
}
