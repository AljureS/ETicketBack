import { Controller, FileTypeValidator, MaxFileSizeValidator, Param, ParseFilePipe, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';

@Controller('cloudinary')
export class CloudinaryController {
    constructor(
        private readonly cloudinaryService: CloudinaryService
    ){}

    @ApiTags('UploadImage')
    //@ApiBearerAuth()
    @Post('uploadImage/:id')
    // @Roles(Role.Admin)
    // @UseGuards(AuthGuard, RolesGuard)
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(
        @Param('id') eventID: string,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({
                        maxSize: 250000,
                        message: 'The file is too large',
                    }),
                    new FileTypeValidator({
                        fileType: /(jpg|jpeg|png|webp|gif|svg)/,
                    })
                ]
            })
        ) file: Express.Multer.File // tipo de tapo "type": ["multer"]
    ){
        return await this.cloudinaryService.uploadImage(file, eventID)
    }
}
