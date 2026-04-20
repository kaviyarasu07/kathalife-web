'use client';

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import UserMenuDropdown from '@/components/UserMenuDropdown';
import { useAuth } from '@/context/AuthContext';
import { userService } from '@/services/userService';
import type {
  BioProfileRequest,
  BioProfileResponse,
  LanguageResponse,
  LifeSummaryRequest,
  LifeSummaryResponse,
  UserResponse,
} from '@/types';

interface BioFormState {
  fullName: string;
  nickname: string;
  dateOfBirth: string;
  gender: string;
  hometown: string;
  profession: string;
  familyDescription: string;
  keyPerson: string;
  personalityWord: string;
  preferredLanguage: string;
  lifeSummary: string;
}

type PageView = 'left' | 'right';

type BioProfileWithDiaryFields = BioProfileResponse & {
  nickname?: string | null;
  gender?: string | null;
  profession?: string | null;
  familyDescription?: string | null;
  keyPerson?: string | null;
  personalityWord?: string | null;
  preferredLanguage?: string | null;
};

type BioProfilePayload = BioProfileRequest & {
  nickname: string;
  gender: string;
  keyPerson: string;
  personalityWord: string;
  preferredLanguage: string;
};

type LifeSummaryWithContent = LifeSummaryResponse & {
  content?: string | null;
};

type LifeSummaryContentPayload = LifeSummaryRequest & {
  content: string;
};

type LanguageOption = LanguageResponse & {
  id?: string;
};

type UserWithOptionalName = UserResponse & {
  fullName?: string | null;
  name?: string | null;
};

type InlineTextInputProps = {
  field: keyof Omit<BioFormState, 'lifeSummary'>;
  value: string;
  placeholder: string;
  maxWidth?: number;
  type?: 'text' | 'date';
  onChange: (field: keyof BioFormState, value: string) => void;
};

type InlineSelectProps = {
  field: keyof Omit<BioFormState, 'lifeSummary'>;
  value: string;
  placeholder: string;
  options: Array<{
    label: string;
    value: string;
  }>;
  onChange: (field: keyof BioFormState, value: string) => void;
};

const emptyForm: BioFormState = {
  fullName: '',
  nickname: '',
  dateOfBirth: '',
  gender: '',
  hometown: '',
  profession: '',
  familyDescription: '',
  keyPerson: '',
  personalityWord: '',
  preferredLanguage: '',
  lifeSummary: '',
};

const genderOptions = [
  { label: 'He/Him', value: 'He/Him' },
  { label: 'She/Her', value: 'She/Her' },
  { label: 'They/Them', value: 'They/Them' },
  { label: 'Prefer not to say', value: 'Prefer not to say' },
];

function readText(value: string | null | undefined): string {
  return value ?? '';
}

function savedAtLabel(date: Date): string {
  return `Saved at ${date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

function InlineTextInput({
  field,
  value,
  placeholder,
  maxWidth = 200,
  type = 'text',
  onChange,
}: InlineTextInputProps) {
  const [width, setWidth] = useState(60);
  const measureWidth = useCallback(
    (node: HTMLSpanElement | null) => {
      if (!node) {
        return;
      }

      setWidth(Math.min(maxWidth, Math.max(60, node.offsetWidth + 14)));
    },
    [maxWidth],
  );

  return (
    <span className="measureWrap">
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        className="inlineEntry"
        style={{ width }}
        onChange={(event) => onChange(field, event.target.value)}
      />
      <span
        key={`${field}-${value}-${placeholder}-${maxWidth}`}
        ref={measureWidth}
        className="widthMeasure"
        aria-hidden="true"
      >
        {value || placeholder}
      </span>
    </span>
  );
}

function InlineSelect({
  field,
  value,
  placeholder,
  options,
  onChange,
}: InlineSelectProps) {
  const [width, setWidth] = useState(86);
  const selectedLabel =
    options.find((option) => option.value === value)?.label || placeholder;
  const measureWidth = useCallback(
    (node: HTMLSpanElement | null) => {
      if (!node) {
        return;
      }

      setWidth(Math.min(220, Math.max(86, node.offsetWidth + 28)));
    },
    [],
  );

  return (
    <span className="inlineSelectWrap">
      <select
        value={value}
        className="inlineEntry inlineSelect"
        style={{ width }}
        onChange={(event) => onChange(field, event.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span
        key={`${field}-${selectedLabel}`}
        ref={measureWidth}
        className="widthMeasure"
        aria-hidden="true"
      >
        {selectedLabel}
      </span>
    </span>
  );
}

export default function DiaryBioPage() {
  const router = useRouter();
  const { setBioCompleted } = useAuth();
  const autosaveTimerRef = useRef<number | null>(null);
  const autosaveHydratedRef = useRef(false);

  const [form, setForm] = useState<BioFormState>(emptyForm);
  const [languages, setLanguages] = useState<LanguageOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageView, setPageView] = useState<PageView>('left');
  const [autosaveStatus, setAutosaveStatus] = useState('Not saved yet');
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [userName, setUserName] = useState('');

  const updateField = useCallback((field: keyof BioFormState, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }, []);

  const saveLifeSummary = useCallback(async (summaryText: string) => {
    setAutosaveStatus('Saving...');

    try {
      const payload: LifeSummaryContentPayload = {
        summaryText,
        content: summaryText,
      };

      await userService.updateLifeSummary(payload);
      setAutosaveStatus(savedAtLabel(new Date()));
    } catch (error) {
      console.error('Failed to autosave bio page life summary', error);
      setAutosaveStatus('Autosave failed');
    }
  }, []);

  const handleLifeSummaryChange = useCallback(
    (value: string) => {
      updateField('lifeSummary', value);

      if (!autosaveHydratedRef.current) {
        return;
      }

      if (autosaveTimerRef.current !== null) {
        window.clearTimeout(autosaveTimerRef.current);
      }

      autosaveTimerRef.current = window.setTimeout(() => {
        saveLifeSummary(value);
      }, 2000);
    },
    [saveLifeSummary, updateField],
  );

  useEffect(() => {
    let mounted = true;

    async function loadBioPage() {
      try {
        const [bioProfile, languageList, lifeSummary, currentUserResponse] = await Promise.all([
          userService.getBioProfile(),
          userService.getLanguages(),
          userService.getLifeSummary(),
          userService.getCurrentUser(),
        ]);

        if (!mounted) {
          return;
        }

        const bio = bioProfile as BioProfileWithDiaryFields;
        const story = lifeSummary as LifeSummaryWithContent;
        const currentUser = currentUserResponse as UserWithOptionalName;

        setLanguages(languageList);
        setUserName(currentUser.fullName || currentUser.name || bio.fullName || currentUser.email || '');
        setForm({
          fullName: readText(bio.fullName),
          nickname: readText(bio.nickname),
          dateOfBirth: readText(bio.dateOfBirth),
          gender: readText(bio.gender),
          hometown: readText(bio.hometown),
          profession: readText(bio.profession ?? bio.occupation),
          familyDescription: readText(bio.familyDescription ?? bio.familyNotes),
          keyPerson: readText(bio.keyPerson),
          personalityWord: readText(bio.personalityWord),
          preferredLanguage: readText(bio.preferredLanguage ?? bio.languagePref),
          lifeSummary: readText(story.content ?? story.summaryText),
        });

        if (story.lastUpdatedAt) {
          setAutosaveStatus(savedAtLabel(new Date(story.lastUpdatedAt)));
        }
      } catch (error) {
        console.error('Failed to load bio page diary data', error);
      } finally {
        if (mounted) {
          setLoading(false);
          autosaveHydratedRef.current = true;
        }
      }
    }

    loadBioPage();

    return () => {
      mounted = false;

      if (autosaveTimerRef.current !== null) {
        window.clearTimeout(autosaveTimerRef.current);
      }
    };
  }, []);

  const handleSaveProfile = useCallback(async () => {
    setSavingProfile(true);
    setSaveError('');

    if (autosaveTimerRef.current !== null) {
      window.clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }

    try {
      const bioPayload: BioProfilePayload = {
        fullName: form.fullName,
        dateOfBirth: form.dateOfBirth,
        hometown: form.hometown,
        occupation: form.profession,
        familyNotes: form.familyDescription,
        languagePref: form.preferredLanguage,
        nickname: form.nickname,
        gender: form.gender,
        keyPerson: form.keyPerson,
        personalityWord: form.personalityWord,
        preferredLanguage: form.preferredLanguage,
      };

      await Promise.all([
        userService.updateBioProfile(bioPayload),
        saveLifeSummary(form.lifeSummary),
      ]);

      setBioCompleted(true);
      router.push('/journal');
    } catch (error) {
      console.error('Failed to save bio page profile before journal redirect', error);
      setSaveError('Something did not save. Please try once more.');
    } finally {
      setSavingProfile(false);
    }
  }, [form, router, saveLifeSummary, setBioCompleted]);

  const languageOptions = languages
    .map((language) => ({
      label: language.nativeName || language.name || language.code,
      value: language.id || language.code || language.name,
    }))
    .filter((language) => language.value.length > 0);

  const pageClass = (view: PageView) =>
    `diaryPage ${view === 'left' ? 'leftPage' : 'rightPage'} ${
      pageView === view ? 'activePage' : 'inactivePage'
    }`;

  return (
    <main className="bioViewport">
      <div className="bookWrap">
        <div className="diaryBook">
          <section className={pageClass('left')} aria-label="About me">
            <div className="pageInner">
              {loading ? (
                <p className="loadingText">Opening your diary...</p>
              ) : (
                <>
                  <header className="pageHeader">
                    <h1>Dear Diary,</h1>
                    <p>Let me tell you about myself...</p>
                  </header>

                  <p className="bioProse">
                    My name is{' '}
                    <InlineTextInput
                      field="fullName"
                      value={form.fullName}
                      placeholder="my name"
                      onChange={updateField}
                    />{' '}
                    but my people have always called me{' '}
                    <InlineTextInput
                      field="nickname"
                      value={form.nickname}
                      placeholder="nickname"
                      onChange={updateField}
                    />
                    . I came into this world on{' '}
                    <InlineTextInput
                      field="dateOfBirth"
                      value={form.dateOfBirth}
                      placeholder="date"
                      type="date"
                      maxWidth={150}
                      onChange={updateField}
                    />{' '}
                    and I am{' '}
                    <InlineSelect
                      field="gender"
                      value={form.gender}
                      placeholder="who I am"
                      options={genderOptions}
                      onChange={updateField}
                    />
                    . I grew up in{' '}
                    <InlineTextInput
                      field="hometown"
                      value={form.hometown}
                      placeholder="hometown"
                      onChange={updateField}
                    />{' '}
                    — a place that shaped everything about me. Today, I work as
                    a{' '}
                    <InlineTextInput
                      field="profession"
                      value={form.profession}
                      placeholder="profession"
                      maxWidth={280}
                      onChange={updateField}
                    />
                    . My family is{' '}
                    <InlineTextInput
                      field="familyDescription"
                      value={form.familyDescription}
                      placeholder="my people"
                      maxWidth={280}
                      onChange={updateField}
                    />
                    . The one person who shaped me most is{' '}
                    <InlineTextInput
                      field="keyPerson"
                      value={form.keyPerson}
                      placeholder="their name"
                      onChange={updateField}
                    />
                    . If I had to describe myself in one word, it would be{' '}
                    <InlineTextInput
                      field="personalityWord"
                      value={form.personalityWord}
                      placeholder="one word"
                      onChange={updateField}
                    />
                    . I want my story told in{' '}
                    <InlineSelect
                      field="preferredLanguage"
                      value={form.preferredLanguage}
                      placeholder="language"
                      options={languageOptions}
                      onChange={updateField}
                    />
                    .
                  </p>
                </>
              )}
            </div>

            <button
              type="button"
              className="mobileFlip nextFlip"
              onClick={() => setPageView('right')}
            >
              Next Page →
            </button>
            <p className="pageNumber">Page 1</p>
          </section>

          <div className="spine" aria-hidden="true" />

          <section className={pageClass('right')} aria-label="My story so far">
            <div className="bioAvatarWrap">
              <UserMenuDropdown userName={userName} />
            </div>
            <div className="ribbon" aria-hidden="true" />
            <div className="pageInner rightPageInner">
              {loading ? (
                <p className="loadingText">Opening your diary...</p>
              ) : (
                <>
                  <header className="pageHeader">
                    <h2>Before this diary began...</h2>
                    <p>
                      Tell me everything — the places, the people, the moments
                      that made you who you are today.
                    </p>
                  </header>

                  <textarea
                    value={form.lifeSummary}
                    className="storyArea"
                    placeholder="My story begins in a small town... I remember the smell of jasmine and rain..."
                    onChange={(event) => handleLifeSummaryChange(event.target.value)}
                  />

                  <div className="storyMeta">
                    <span>{form.lifeSummary.length} characters</span>
                    <span>{autosaveStatus}</span>
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              className="mobileFlip backFlip"
              onClick={() => setPageView('left')}
            >
              ← Back
            </button>
            <p className="pageNumber">Page 2</p>
          </section>

          <div className="coverEdge" aria-hidden="true" />
        </div>

        <div className="bottomActions">
          <button
            type="button"
            className="journeyButton"
            disabled={loading || savingProfile}
            onClick={handleSaveProfile}
          >
            {savingProfile ? 'Saving...' : 'Save & Begin My Journey →'}
          </button>
          {saveError ? <p className="saveError">{saveError}</p> : null}
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400;1,600&family=Lora:ital,wght@0,400;0,500;1,400;1,500&family=Patrick+Hand&display=swap');

        .bioViewport {
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          background: #f0ebe1;
          color: #3d2b1f;
          font-family: 'Lora', Georgia, serif;
        }

        .bookWrap {
          display: flex;
          height: 100%;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3vh 24px;
        }

        .diaryBook {
          position: relative;
          display: flex;
          width: min(1100px, 94vw);
          height: min(88vh, calc(100vh - 94px));
          min-height: 560px;
          box-shadow: 0 8px 40px rgba(0, 0, 0, 0.18);
        }

        .diaryPage {
          position: relative;
          width: 50%;
          min-width: 0;
          border: 1px solid #ddd0bb;
          padding: 40px 44px;
          transition:
            opacity 0.28s ease,
            transform 0.28s ease;
        }

        .leftPage {
          background: #fdfaf5;
          border-right: 0;
        }

        .rightPage {
          background: #fff9f0;
          border-left: 0;
        }

        .pageInner {
          position: relative;
          height: 100%;
        }

        .rightPageInner {
          display: flex;
          flex-direction: column;
        }

        .spine {
          width: 3px;
          flex: 0 0 3px;
          background: linear-gradient(to right, #c8b89a, #e8dcc8, #c8b89a);
        }

        .coverEdge {
          position: absolute;
          right: 0;
          bottom: -8px;
          left: 0;
          height: 8px;
          background: #ede5d8;
          border: 1px solid #ddd0bb;
          border-top: 0;
        }

        .ribbon {
          position: absolute;
          top: 0;
          right: 28px;
          z-index: 2;
          width: 6px;
          height: 60px;
          background: #8b1a1a;
          clip-path: polygon(0 0, 100% 0, 100% 88%, 50% 100%, 0 88%);
        }

        .bioAvatarWrap {
          position: absolute;
          top: 18px;
          right: 18px;
          z-index: 5;
        }

        .pageHeader {
          margin-bottom: 28px;
        }

        .pageHeader h1,
        .pageHeader h2 {
          margin: 0 0 8px;
          color: #2c1810;
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic;
          font-weight: 600;
          letter-spacing: 0;
        }

        .pageHeader h1 {
          font-size: 28px;
        }

        .pageHeader h2 {
          font-size: 26px;
        }

        .pageHeader p {
          max-width: 430px;
          margin: 0;
          color: #9b8b7a;
          font-family: 'Lora', Georgia, serif;
          font-size: 13px;
          font-style: italic;
          line-height: 1.6;
        }

        .bioProse {
          margin: 0;
          color: #3d2b1f;
          font-family: 'Lora', Georgia, serif;
          font-size: clamp(13px, 1.35vh, 15px);
          line-height: 1.9;
        }

        .measureWrap,
        .inlineSelectWrap {
          position: relative;
          display: inline-block;
          max-width: 280px;
          vertical-align: baseline;
        }

        .inlineEntry {
          display: inline;
          min-width: 60px;
          max-width: 280px;
          border: 0;
          border-bottom: 1px dotted transparent;
          border-radius: 0;
          background: transparent;
          color: #3d2b1f;
          font-family: 'Patrick Hand', cursive;
          font-size: 15px;
          line-height: 1.35;
          outline: none;
          padding: 0 2px;
          transition: border-bottom-color 0.2s ease;
        }

        .inlineEntry:hover {
          border-bottom-color: #c4a882;
        }

        .inlineEntry:focus {
          border-bottom-color: #c4922a;
        }

        .inlineEntry::placeholder {
          color: #b8a898;
        }

        .inlineEntry[type='date'] {
          color-scheme: light;
        }

        .inlineEntry[type='date']::-webkit-calendar-picker-indicator {
          opacity: 0.25;
          cursor: pointer;
        }

        .inlineSelect {
          appearance: none;
          padding-right: 16px;
          cursor: pointer;
        }

        .inlineSelectWrap::after {
          position: absolute;
          right: 2px;
          bottom: 1px;
          color: #c4a882;
          font-family: 'Lora', Georgia, serif;
          font-size: 12px;
          content: '▾';
          pointer-events: none;
        }

        .widthMeasure {
          position: absolute;
          left: -9999px;
          visibility: hidden;
          white-space: pre;
          font-family: 'Patrick Hand', cursive;
          font-size: 15px;
        }

        .storyArea {
          width: 100%;
          height: calc(100% - 140px);
          flex: 1;
          border: 0;
          background: transparent;
          color: #2c1810;
          font-family: 'Patrick Hand', cursive;
          font-size: clamp(14px, 1.35vh, 15px);
          line-height: 1.9;
          outline: none;
          resize: none;
        }

        .storyArea::placeholder {
          color: #c4a882;
        }

        .storyMeta {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          margin-top: 14px;
          color: #b8a898;
          font-family: 'Lora', Georgia, serif;
          font-size: 11px;
          font-style: italic;
        }

        .pageNumber {
          position: absolute;
          right: 0;
          bottom: 18px;
          left: 0;
          margin: 0;
          color: #b8a898;
          font-family: 'Lora', Georgia, serif;
          font-size: 11px;
          font-style: italic;
          text-align: center;
        }

        .loadingText {
          position: absolute;
          top: 50%;
          right: 0;
          left: 0;
          margin: 0;
          transform: translateY(-50%);
          color: #9b8b7a;
          font-family: 'Lora', Georgia, serif;
          font-size: 14px;
          font-style: italic;
          text-align: center;
        }

        .bottomActions {
          display: flex;
          min-height: 56px;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          margin-top: 18px;
        }

        .journeyButton {
          border: 0;
          border-radius: 0;
          background: #c4922a;
          color: #ffffff;
          cursor: pointer;
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 15px;
          font-weight: 600;
          padding: 12px 36px;
          transition:
            background-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .journeyButton:hover:not(:disabled),
        .journeyButton:focus-visible:not(:disabled) {
          background: #a67820;
          box-shadow: 0 4px 16px rgba(196, 146, 42, 0.3);
          outline: none;
        }

        .journeyButton:disabled {
          cursor: not-allowed;
          opacity: 0.62;
        }

        .saveError {
          margin: 8px 0 0;
          color: #8b1a1a;
          font-family: 'Lora', Georgia, serif;
          font-size: 12px;
          font-style: italic;
        }

        .mobileFlip {
          display: none;
        }

        @media (max-width: 767px) {
          .bioViewport {
            height: auto;
            min-height: 100vh;
            overflow: visible;
          }

          .bookWrap {
            display: block;
            min-height: 100vh;
            padding: 0;
          }

          .diaryBook {
            display: block;
            width: 100%;
            height: auto;
            min-height: 100vh;
            box-shadow: none;
            overflow: hidden;
          }

          .diaryPage {
            position: absolute;
            inset: 0;
            width: 100%;
            min-height: 100vh;
            overflow-y: auto;
            border: 0;
            padding: 34px 26px 84px;
          }

          .activePage {
            z-index: 2;
            opacity: 1;
            pointer-events: auto;
            transform: translateX(0);
          }

          .inactivePage {
            z-index: 1;
            opacity: 0;
            pointer-events: none;
          }

          .leftPage.inactivePage {
            transform: translateX(-18px);
          }

          .rightPage.inactivePage {
            transform: translateX(18px);
          }

          .spine,
          .coverEdge {
            display: none;
          }

          .pageInner,
          .rightPageInner {
            min-height: calc(100vh - 118px);
          }

          .pageHeader h1 {
            font-size: 28px;
          }

          .pageHeader h2 {
            font-size: 26px;
          }

          .bioProse,
          .storyArea {
            font-size: 15px;
          }

          .storyArea {
            min-height: 58vh;
          }

          .mobileFlip {
            position: fixed;
            z-index: 4;
            bottom: 22px;
            display: block;
            border: 0;
            background: transparent;
            color: #8b7355;
            cursor: pointer;
            font-family: 'Lora', Georgia, serif;
            font-size: 13px;
            font-style: italic;
          }

          .nextFlip {
            right: 24px;
          }

          .backFlip {
            left: 24px;
          }

          .bottomActions {
            position: fixed;
            right: 0;
            bottom: 18px;
            left: 0;
            z-index: 3;
            min-height: 0;
            margin-top: 0;
            pointer-events: none;
          }

          .journeyButton,
          .saveError {
            pointer-events: auto;
          }

          .journeyButton {
            padding: 10px 24px;
          }

          .pageNumber {
            bottom: 58px;
          }
        }
      `}</style>
    </main>
  );
}
