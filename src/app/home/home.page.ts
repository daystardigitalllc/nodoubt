import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  arrowForward,
  searchOutline,
} from 'ionicons/icons';

interface DoubtCategory {
  title: string;
  description: string;
  examples: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [FormsModule, IonButton, IonContent, IonIcon, IonInput],
})
export class HomePage {
  private readonly router = inject(Router);

  question = '';

  readonly popularQuestions = [
    'Is God even real?',
    'Why does God allow suffering?',
    'Can I trust the Bible?',
  ];

  readonly categories: DoubtCategory[] = [
    {
      title: 'God & existence',
      description: 'Evidence, reason, creation, and the nature of God.',
      examples: 'Is God real? · Why is there something instead of nothing?',
    },
    {
      title: 'Bible & truth',
      description: 'Reliability, interpretation, history, and hard passages.',
      examples: 'Can I trust the Bible? · Why are there different translations?',
    },
    {
      title: 'Pain & suffering',
      description: 'Honest help for grief, injustice, fear, and unanswered prayer.',
      examples: 'Why does God allow suffering? · Why was my prayer unanswered?',
    },
    {
      title: 'Faith & doubt',
      description: 'Questions about belief, salvation, prayer, and spiritual dryness.',
      examples: 'Is doubt a sin? · What if I do not feel close to God?',
    },
  ];

  constructor() {
    addIcons({
      arrowForward,
      searchOutline,
    });
  }

  ask(question = this.question): void {
    const normalizedQuestion = question.trim();
    if (!normalizedQuestion) return;

    void this.router.navigate(['/answer'], {
      queryParams: { q: normalizedQuestion },
    });
  }

  exploreCategory(category: DoubtCategory): void {
    void this.router.navigate(['/answer'], {
      queryParams: { q: category.title },
    });
  }
}
