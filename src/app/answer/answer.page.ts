import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { bookmarkOutline } from 'ionicons/icons';

@Component({
  selector: 'app-answer',
  templateUrl: './answer.page.html',
  styleUrls: ['./answer.page.scss'],
  imports: [IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonTitle, IonToolbar, RouterLink],
})
export class AnswerPage implements OnInit {
  private readonly route = inject(ActivatedRoute);

  question = 'Is God even real?';

  readonly verses = [
    {
      reference: 'Psalm 19:1 (WEB)',
      text: 'The heavens declare the glory of God. The expanse shows his handiwork.',
      note: 'The biblical writers point to creation as something that can lead us to ask about its Creator.',
    },
    {
      reference: 'Romans 1:20 (WEB)',
      text: 'For the invisible things of him since the creation of the world are clearly seen, being perceived through the things that are made, even his everlasting power and divinity.',
      note: 'Paul argues that the order and existence of the world give real, though not exhaustive, knowledge of God.',
    },
  ];

  constructor() {
    addIcons({ bookmarkOutline });
  }

  ngOnInit(): void {
    const query = this.route.snapshot.queryParamMap.get('q')?.trim();
    if (query) this.question = query;
  }
}
