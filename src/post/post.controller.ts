import { Controller } from '@nestjs/common';

import { PostService } from './post.service';

@Controller('posts')
export class PostController {
  constructor(private postService: PostService) {}
}
