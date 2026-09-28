import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonIcon,
  IonInput,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  arrowForward,
  bookOutline,
  heartOutline,
  helpCircleOutline,
  searchOutline,
  shieldCheckmarkOutline,
} from 'ionicons/icons';

interface DoubtCategory {
  title: string;
  description: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [FormsModule, IonButton, IonCard, IonCardContent, IonContent, IonIcon, IonInput],
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
      icon: 'search-outline',
      color: 'blue',
    },
    {
      title: 'Bible & truth',
      description: 'Reliability, interpretation, history, and hard passages.',
      icon: 'book-outline',
      color: 'gold',
    },
    {
      title: 'Pain & suffering',
      description: 'Honest help for grief, injustice, fear, and unanswered prayer.',
      icon: 'heart-outline',
      color: 'rose',
    },
    {
      title: 'Faith & doubt',
      description: 'Questions about belief, salvation, prayer, and spiritual dryness.',
      icon: 'help-circle-outline',
      color: 'green',
    },
  ];

  constructor() {
    addIcons({
      arrowForward,
      bookOutline,
      heartOutline,
      helpCircleOutline,
      searchOutline,
      shieldCheckmarkOutline,
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
